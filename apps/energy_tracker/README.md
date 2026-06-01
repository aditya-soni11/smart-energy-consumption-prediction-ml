# Smart Energy Consumption Prediction ⚡

A professional analytics platform developed as an academic project at **SKIT Jaipur**. This system predicts regional energy consumption patterns using Machine Learning (Random Forest Regression) based on historical smart meter data and meteorological features.

![Dashboard Preview](./screenshots/overview_preview.png)

## 🌟 Key Features

- **Predictive Analytics**: Forecasting energy demand using a Random Forest Regression model trained on 24 months of data.
- **Operational Dashboard**: Real-time visualization of consumption trends, temperature correlations, and peak load analysis.
- **Hybrid Data Management**: Seamless integration of large-scale historical CSV data with a local SQLite database for manual user entries.
- **Mobile-Ready (PWA)**: Optimized for mobile viewing with a dedicated bottom-bar navigation and installable app experience.
- **Academic Context**: Developed for the Department of CSE, SKIT Jaipur, under the guidance of Mrs. Karuna Sharma.

## 🛠️ Tech Stack

- **Frontend**: React, Vite, Tailwind CSS, Lucide Icons, Recharts (Data Viz).
- **Backend**: Python, FastAPI/Flask pattern, Scikit-learn (ML), Pandas (Data Processing).
- **Database**: SQLite (Local persistence for manual readings).
- **Dataset**: London Smart Meter Dataset.

## 🚀 Getting Started

### Prerequisites
- Python 3.8+
- Node.js 18+
- npm

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/energy-tracker.git
   cd energy-tracker
   ```

2. **Backend Setup**
   ```bash
   cd backend
   pip install -r requirements.txt
   python main.py
   ```

3. **Frontend Setup**
   ```bash
   cd ../frontend
   npm install
   npm run dev
   ```

## 📊 Methodology

### The Model
We utilized **Random Forest Regression** due to its robustness against outliers and ability to capture non-linear relationships between thermodynamic variables (Temperature, Humidity) and energy load.

### The Dataset
The project utilizes the **London Smart Meter Dataset**, comprising thousands of daily readings. Pre-processing involves outlier removal, timestamp normalization, and feature engineering (Year, Month, Day, Temp).

## 👥 Contributors (6CSA-G1)
- Aditya Soni
- Akshat Kumawat
- Amanjeet Singh

## 🎓 Guidance
**Mrs. Karuna Sharma**  
Assistant Professor, SKIT Jaipur

---
© 2026 SKIT Jaipur - Machine Learning Innovation Cell
