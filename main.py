from fastapi import FastAPI, UploadFile, File, Form
import uvicorn
import numpy as np
import torch
import torch.nn.functional as F
from PIL import Image
from io import BytesIO

app = FastAPI()

try:
    torch.backends.quantized.engine = 'fbgemm' 
except:
    pass

MODEL_PATH = "./assets/models/urban_heat_model_quantized_v2.ptl"
model = torch.jit.load(MODEL_PATH)
model.eval()

T_MIN = 15.0
T_MAX = 39.0

@app.post("/infer")
async def infer(image: UploadFile = File(...),
                material: str = Form(...),
                gps: str = Form(...)
):
    # Read image
    contents = await image.read()
    img = Image.open(BytesIO(contents)).convert('RGB')

    img_resized = img.resize((256, 256))
    
    img_np = np.array(img_resized).transpose(2, 0, 1) / 255.0
    img_tensor = torch.from_numpy(img_np).float().unsqueeze(0)

    with torch.no_grad():
        output_tensor = model(img_tensor)
        
        heatmap_16x16 = F.interpolate(output_tensor, size=(16, 16), mode='bilinear')
        heatmap_np = heatmap_16x16.squeeze().numpy()

    heatmap_celsius = heatmap_np * (T_MAX - T_MIN) + T_MIN
    
    heatmap_final = heatmap_celsius.tolist()

    print(f"Inference Complete for {material} at {gps}")

    return {
        "status": "success",
        "heatmap": heatmap_final,
        "metadata": {
            "max_temp": round(float(np.max(heatmap_celsius)), 1),
            "min_temp": round(float(np.min(heatmap_celsius)), 1),
            "material_validated": material,
            "coordinates": gps
        }
    }

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)