# Tag-init: Mobile Thermal Sensing

**Physics-Informed Neural Networks for Urban Heat Mitigation**

Tag-init is the mobile client for the **Tag-init Project**—a specialized tool designed to combat the **Urban Heat Island (UHI)** effect in Metro Manila. By leveraging edge-computing and mobile camera sensors, this application enables urban planners, community members, and researchers to capture real-time thermal snapshots and process them through our proprietary **Physics-Informed Neural Network (PINN)** pipeline.

---

## Technical Architecture

This application bridges the gap between raw optical photography and hyper-local thermal intelligence.

- **Frontend:** React Native (Expo)
- **Sensor Fusion:** Integrates `expo-camera` and `expo-location` to provide geo-tagged thermal insights
- **Edge Inference:** Optimized for low-latency communication with backend ML pipeline
- **Thermal Super-Resolution:** Uses a Physics-Informed Neural Network (PINN) to upscale coarse thermal data to **10 m resolution**, providing actionable insights that satellite imagery misses

---

## Key Features

- **Live Thermal Lens:** Real-time visualization of thermal gradients on city surfaces (asphalt, galvanized iron sheets, etc.)
- **ML-Powered Insights:** Automatic analysis of surface emissivity and heat risk, with mitigation recommendations (e.g., _“Recommend permeable paving”_)
- **Offline/Online Uploads:** Capture current street-level heat or upload past observations for multi-temporal comparative analysis
- **Geo Data Mapping:** Geo-tagged snapshots contribute to a community-driven heat map, fostering collaborative urban planning in the Philippines

---

> **Note:** ML model training code and data pre-processing scripts are maintained in a **separate repository:**.
> `https://github.com/Arxivory/TagInit-ML-Core.git` \
> This mobile app serves strictly as the client-side interface for inference.

---

## Scientific Context

Traditional satellite data at **100 m resolution** often averages out crucial urban heat signatures.  
Tag-init implements a **spatial super-resolution pipeline** to bridge this gap. By inputting multi-spectral guidance into our PINN model, we deliver **10 m street-level resolution**, enabling identification of individual hot spots in the built environment.

---

## Target Users

- Urban planners seeking actionable heat mitigation strategies
- Community members contributing to collaborative heat mapping
- Researchers studying UHI dynamics in tropical megacities
