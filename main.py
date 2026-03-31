from fastapi import FastAPI, UploadFile, File, Form
import uvicorn
import numpy as np
from PIL import Image
from io import BytesIO

app = FastAPI()

@app.post("/infer")
async def infer(image: UploadFile = File(...),
                material: str = Form(...),
                gps: str = Form(...)
):
    contents = await image.read()
    img = Image.open(BytesIO(contents)).convert('RGB')

    img_resized = img.resize((256, 256))
    img_array = np.array(img_resized) / 255.0

    grid_size = 16
    heatmap = np.random.uniform(30.0, 55.0, (grid_size, grid_size)).tolist()

    print(f"Inference Complete for {material} at {gps}")

    return {
        "status": "success",
        "heatmap": heatmap,
        "metadata": {
            "max_temp": round(float(np.max(heatmap)), 1),
            "min_temp": round(float(np.min(heatmap)), 1),
            "material_validated": material,
            "coordinates": gps
        }
    }

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
