// lib/data/curatedProjects.ts
import type { MiniProject } from "@/lib/types/projects";

export const CURATED_PROJECTS: MiniProject[] = [
  // =========================================================================
  // 1. DATA SCIENCE & AI PROJECTS
  // =========================================================================
  {
    id: "ds-student-attrition",
    title: "Student Academic Performance & Dropout Risk Predictor",
    tagline: "Classify at-risk students and explain predictions with SHAP feature importance.",
    branch: "Data Science & AI",
    year: "Second Year (SE)",
    difficulty: "Intermediate (1-2 Weeks)",
    estimatedHours: 18,
    skills: ["Python", "Pandas", "Scikit-Learn", "Streamlit", "SHAP"],
    overview:
      "Build a machine learning pipeline that ingests student demographic, attendance, and midterm score records to identify early signs of academic attrition. Features an interactive Streamlit dashboard allowing academic counselors to simulate how attendance improvements decrease risk score.",
    realWorldImpact:
      "Institutions use predictive student retention models to intervene early with tutoring and academic counseling, boosting graduation rates by 12-18%.",
    architecture:
      "CSV Dataset -> Data Preprocessing & One-Hot Encoding -> Random Forest / XGBoost Classifier -> SHAP Explainability Engine -> Streamlit Interactive Web App.",
    milestones: [
      {
        phase: "Phase 1: Exploratory Data Analysis & Cleaning",
        title: "Ingest & clean the Higher Education Students Performance dataset",
        description: "Analyze missing values, encode categorical variables (scholarship status, parent education, study hours), and inspect class imbalance.",
        tasks: [
          "Download student academic dataset from UCI ML Repository or Kaggle.",
          "Check distribution of target variable (Dropout / Enrolled / Graduated).",
          "Apply SMOTE or class weighting if dropout instances are imbalanced.",
          "Generate correlation heatmaps between attendance and final GPA.",
        ],
      },
      {
        phase: "Phase 2: Model Training & Hyperparameter Tuning",
        title: "Train Random Forest and Logistic Regression benchmarks",
        description: "Evaluate models using Stratified K-Fold cross-validation focusing on Recall and F1-Score over simple Accuracy.",
        tasks: [
          "Split data into 80/20 train/test sets with stratification.",
          "Train Logistic Regression baseline and Random Forest / LightGBM models.",
          "Tune max_depth and min_samples_split using GridSearchCV.",
          "Plot Confusion Matrix and ROC-AUC curve (targeting AUC > 0.85).",
        ],
      },
      {
        phase: "Phase 3: Explainability & Counselor Dashboard",
        title: "Deploy Streamlit dashboard with SHAP explanation plots",
        description: "Allow counselors to input a student's profile and see exactly which factors (e.g., failed units, tuition arrears) drove the risk prediction.",
        tasks: [
          "Compute TreeExplainer SHAP values for individual test samples.",
          "Build Streamlit sidebar with student attribute sliders (Attendance %, Midterm Grade, Study Hours).",
          "Display risk gauge (Low / Moderate / High) with real-time SHAP waterfall plot.",
        ],
      },
    ],
    starterCode: {
      language: "python",
      filename: "app_predictor.py",
      code: `import streamlit as st
import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
import shap
import matplotlib.pyplot as plt

st.set_page_config(page_title="Student Dropout Risk AI", layout="wide")
st.title("🎓 Student Retention & Dropout Risk Predictor")

# 1. Mock training data generation (or load your UCI dataset)
@st.cache_resource
def train_model():
    np.random.seed(42)
    n = 1000
    attendance = np.random.uniform(40, 100, n)
    midterm = np.random.uniform(30, 95, n)
    assignment_rate = np.random.uniform(50, 100, n)
    study_hrs_per_week = np.random.uniform(2, 25, n)
    
    # Probability of dropout based on weighted signals
    score = (100 - attendance)*0.4 + (100 - midterm)*0.35 + (100 - assignment_rate)*0.15 - study_hrs_per_week*1.5
    dropout = (score > 35).astype(int)
    
    df = pd.DataFrame({
        'Attendance_Rate': attendance,
        'Midterm_Exam': midterm,
        'Assignment_Submission': assignment_rate,
        'Study_Hours_Weekly': study_hrs_per_week,
        'Dropout': dropout
    })
    
    X = df.drop(columns=['Dropout'])
    y = df['Dropout']
    model = RandomForestClassifier(n_estimators=100, max_depth=5, random_state=42)
    model.fit(X, y)
    explainer = shap.TreeExplainer(model)
    return model, explainer, X

model, explainer, X_sample = train_model()

# 2. Student Input Form
st.sidebar.header("Input Student Metrics")
att = st.sidebar.slider("Attendance Rate (%)", 30, 100, 78)
mid = st.sidebar.slider("Midterm Exam Score", 20, 100, 62)
sub = st.sidebar.slider("Assignment Submission Rate (%)", 20, 100, 85)
hrs = st.sidebar.slider("Weekly Study Hours", 1, 30, 12)

input_df = pd.DataFrame([{
    'Attendance_Rate': att,
    'Midterm_Exam': mid,
    'Assignment_Submission': sub,
    'Study_Hours_Weekly': hrs
}])

# 3. Prediction & Risk Gauge
prob = model.predict_proba(input_df)[0][1]
col1, col2 = st.columns([1, 2])

with col1:
    st.subheader("Assessment")
    if prob > 0.6:
        st.error(f"⚠️ HIGH ATTRITION RISK ({prob*100:.1f}%)")
    elif prob > 0.35:
        st.warning(f"⚡ MODERATE RISK ({prob*100:.1f}%)")
    else:
        st.success(f"✅ ON TRACK ({prob*100:.1f}%)")

with col2:
    st.subheader("Key Driving Factors (SHAP Explanation)")
    shap_vals = explainer(input_df)
    fig, ax = plt.subplots(figsize=(6, 3))
    shap.plots.waterfall(shap_vals[0], show=False)
    st.pyplot(fig)
`,
    },
    recommendedResources: [
      {
        name: "UCI Higher Education Students Performance Dataset",
        url: "https://archive.ics.uci.edu/dataset/697/predict+students+dropout+and+academic+success",
        type: "dataset",
      },
      {
        name: "SHAP (SHapley Additive exPlanations) Documentation",
        url: "https://shap.readthedocs.io",
        type: "documentation",
      },
      {
        name: "Streamlit Cloud Free App Hosting",
        url: "https://streamlit.io/cloud",
        type: "tool",
      },
    ],
    resumeBulletPoints: [
      "Engineered an end-to-end Student Dropout Risk Predictor using Scikit-Learn Random Forest, attaining an 88.4% ROC-AUC score across 4,400+ collegiate records.",
      "Integrated SHAP tree interpretability to provide explainable risk factors, allowing academic mentors to isolate key drop-off drivers in real time.",
      "Deployed a responsive interactive Streamlit web dashboard supporting dynamic scenario simulations and multi-attribute student risk auditing.",
    ],
  },

  {
    id: "ds-house-price-choropleth",
    title: "City Real-Estate Price Prediction & Geospatial Heatmap",
    tagline: "Predict neighborhood price-per-square-foot and map high-ROI clusters using Folium.",
    branch: "Data Science & AI",
    year: "First Year (FE)",
    difficulty: "Beginner (Weekend)",
    estimatedHours: 12,
    skills: ["Python", "Pandas", "Scikit-Learn", "Folium", "Matplotlib"],
    overview:
      "Analyze historical residential housing sales data, clean outlier square footage, engineer distance-to-transit features, and train a Gradient Boosted Regressor to predict unit property valuation. Renders an interactive geospatial choropleth map highlighting undervalued investment pockets.",
    realWorldImpact:
      "Proptech startups like Zillow and Redfin utilize automated valuation models (AVMs) to estimate fair home values within 2.5% median error.",
    architecture:
      "GeoJSON + Housing CSV -> Feature Engineering (Haversine Distance, Log Price) -> XGBoost Regressor -> Folium Interactive HTML Map.",
    milestones: [
      {
        phase: "Phase 1: Geospatial Feature Engineering",
        title: "Clean raw coordinates and compute distance to central amenities",
        description: "Handle extreme price outliers using IQR filtering and compute proximity to metro stations using the Haversine distance formula.",
        tasks: [
          "Import Kaggle Housing dataset (e.g., California Housing or Bangalore Real Estate).",
          "Remove coordinates outside city boundaries.",
          "Calculate Haversine distance from each property to the nearest metro station.",
          "Log-transform price target to stabilize variance.",
        ],
      },
      {
        phase: "Phase 2: Regression Modeling",
        title: "Train Random Forest & Ridge Regression models",
        description: "Compare RMSE and Mean Absolute Percentage Error (MAPE) against simple price-per-sqft baselines.",
        tasks: [
          "Perform 5-fold cross-validation.",
          "Benchmark Linear Regression vs Random Forest Regressor.",
          "Evaluate on holdout test set with Root Mean Squared Error (RMSE).",
        ],
      },
      {
        phase: "Phase 3: Interactive Heatmap Visualization",
        title: "Render Folium map with marker clusters and price popups",
        description: "Export a standalone interactive HTML map displaying neighborhood boundary overlays colored by median square-foot rates.",
        tasks: [
          "Initialize Folium map centered on target metropolitan coordinates.",
          "Add CircleMarker layers with color gradients (Green: Affordable, Red: Luxury).",
          "Bind hover popups showing predicted vs actual valuation.",
        ],
      },
    ],
    starterCode: {
      language: "python",
      filename: "house_map_pipeline.py",
      code: `import pandas as pd
import numpy as np
from sklearn.ensemble import GradientBoostingRegressor
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_absolute_percentage_error
import folium
from folium.plugins import FastMarkerCluster

# 1. Load Data
df = pd.read_csv("housing.csv")
# Filter valid coordinates
df = df.dropna(subset=['latitude', 'longitude', 'median_house_value'])

# 2. Train Regressor
features = ['housing_median_age', 'total_rooms', 'median_income', 'latitude', 'longitude']
X = df[features]
y = np.log1p(df['median_house_value'])

X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
model = GradientBoostingRegressor(n_estimators=100, learning_rate=0.1, random_state=42)
model.fit(X_train, y_train)

preds = np.expm1(model.predict(X_test))
actuals = np.expm1(y_test)
mape = mean_absolute_percentage_error(actuals, preds)
print(f"Model Test MAPE: {mape*100:.2f}%")

# 3. Create Folium Map
center_lat, center_lon = df['latitude'].mean(), df['longitude'].mean()
m = folium.Map(location=[center_lat, center_lon], zoom_start=11, tiles="CartoDB positron")

locations = list(zip(df['latitude'][:500], df['longitude'][:500]))
FastMarkerCluster(data=locations).add_to(m)
m.save("property_valuation_map.html")
print("Saved interactive map to property_valuation_map.html")
`,
    },
    recommendedResources: [
      {
        name: "California Housing Dataset (Scikit-Learn)",
        url: "https://scikit-learn.org/stable/modules/generated/sklearn.datasets.fetch_california_housing.html",
        type: "dataset",
      },
      {
        name: "Folium Python Geospatial Library",
        url: "https://python-visualization.github.io/folium/",
        type: "documentation",
      },
    ],
    resumeBulletPoints: [
      "Built a geospatial property valuation system combining XGBoost regression with Folium geospatial clustering, achieving a 9.2% MAPE.",
      "Engineered location proximity metrics using Haversine transit distances to capture localized price premiums.",
      "Exported high-performance interactive HTML heatmaps enabling instant neighborhood price exploration across 20,000+ real-estate parcels.",
    ],
  },

  {
    id: "ds-campus-canteen-forecaster",
    title: "Campus Canteen Food Demand & Waste Forecaster",
    tagline: "Forecast daily meal portions to slash institutional food waste using Facebook Prophet.",
    branch: "Data Science & AI",
    year: "Third Year (TE)",
    difficulty: "Intermediate (1-2 Weeks)",
    estimatedHours: 20,
    skills: ["Python", "Pandas", "Prophet", "Plotly", "Time-Series"],
    overview:
      "Colleges and cafeterias prepare hundreds of meals daily with up to 30% waste during exam weeks or weekends. Ingest multi-semester transactional cafeteria logs, holiday calendars, and academic schedules to forecast daily meal counts 7 days in advance with confidence bounds.",
    realWorldImpact:
      "Institutional food forecasting reduces annual kitchen overhead by $25,000+ while cutting landfill emissions from unserved cafeteria meals.",
    architecture:
      "Cafeteria Billing Logs -> Calendar & Exam Event Flags -> Facebook Prophet Model -> Plotly Interactive Forecast & Kitchen Prep Sheet.",
    milestones: [
      {
        phase: "Phase 1: Time Series Decomposition",
        title: "Aggregate meal transactions into daily time-series",
        description: "Identify weekly seasonality (high Tue-Thu, low Sat-Sun) and semester holiday dips.",
        tasks: [
          "Convert timestamp column to DatetimeIndex.",
          "Group by date and meal category (Breakfast, Lunch, Dinner).",
          "Impute days where canteen was closed with zero or holiday flags.",
        ],
      },
      {
        phase: "Phase 2: Prophet Modeling with Custom Regressors",
        title: "Incorporate exam schedules and weather as external regressors",
        description: "Add custom holiday windows for semester study leaves and campus festivals.",
        tasks: [
          "Format DataFrame into ds (date) and y (meal count) columns.",
          "Add holiday dataframe with collegiate vacation dates.",
          "Train Prophet model with multiplicative weekly seasonality.",
        ],
      },
      {
        phase: "Phase 3: Kitchen Inventory Recommendations",
        title: "Output daily perishable procurement recommendations",
        description: "Convert meal count predictions into raw ingredient mass estimates (rice, vegetables, milk).",
        tasks: [
          "Forecast next 14 days with 80% and 95% uncertainty intervals.",
          "Export CSV procurement sheet for kitchen managers.",
          "Plot interactive trend components using Plotly.",
        ],
      },
    ],
    starterCode: {
      language: "python",
      filename: "canteen_forecaster.py",
      code: `import pandas as pd
from prophet import Prophet
import plotly.graph_objects as go

# 1. Load historical daily meal consumption (ds: date, y: meals served)
df = pd.read_csv("daily_canteen_meals.csv")
df['ds'] = pd.to_datetime(df['ds'])

# 2. Configure Prophet with Academic Holiday Windows
holidays = pd.DataFrame({
    'holiday': 'exam_prep_leave',
    'ds': pd.to_datetime(['2024-05-01', '2024-05-02', '2024-11-15', '2024-11-16']),
    'lower_window': -1,
    'upper_window': 3,
})

m = Prophet(holidays=holidays, weekly_seasonality=True, yearly_seasonality=True)
m.fit(df)

# 3. Predict Next 14 Days
future = m.make_future_dataframe(periods=14)
forecast = m.predict(future)

# 4. Print Next Week's Recommended Portions
next_week = forecast[['ds', 'yhat', 'yhat_lower', 'yhat_upper']].tail(7)
print("=== RECOMMENDED MEAL PREP PORTIONS ===")
for _, row in next_week.iterrows():
    print(f"{row['ds'].strftime('%a %d %b')}: {int(row['yhat'])} portions (Range: {int(row['yhat_lower'])}-{int(row['yhat_upper'])})")
`,
    },
    recommendedResources: [
      {
        name: "Meta Prophet Time Series Library",
        url: "https://facebook.github.io/prophet/",
        type: "documentation",
      },
      {
        name: "Plotly Interactive Python Graphing",
        url: "https://plotly.com/python/",
        type: "documentation",
      },
    ],
    resumeBulletPoints: [
      "Developed a time-series meal forecasting model using Prophet, reducing predicted cafeteria over-preparation by 22% across 3 semesters.",
      "Integrated academic calendar regressors and semester exam indicators to handle non-stationary institutional demand shocks.",
      "Built an automated Python inventory pipeline translating daily forecast volume into raw ingredient purchase orders.",
    ],
  },

  // =========================================================================
  // 2. COMPUTER SCIENCE & IT PROJECTS
  // =========================================================================
  {
    id: "cs-markdown-vault",
    title: "Collaborative Code Snippet & Cheatsheet Vault",
    tagline: "Build a full-stack developer snippet manager with instant search, syntax highlighting & tags.",
    branch: "Computer Science & IT",
    year: "Second Year (SE)",
    difficulty: "Intermediate (1-2 Weeks)",
    estimatedHours: 16,
    skills: ["React", "Next.js", "TypeScript", "Tailwind CSS", "Supabase"],
    overview:
      "Engineers constantly copy and paste reusable algorithms, regex patterns, and bash configs. Build a clean, glassmorphic code snippet notebook featuring instant tag filtering, Monaco/Prism syntax highlighting, one-click clipboard copy, and Supabase cloud sync.",
    realWorldImpact:
      "Developer productivity apps like Raycast Snippets and GitHub Gists streamline engineering handoffs and save programmers 30+ minutes daily.",
    architecture:
      "Next.js App Router -> React Client Components -> Tailwind CSS Glassmorphism -> Supabase PostgreSQL Database with Row-Level Security.",
    milestones: [
      {
        phase: "Phase 1: Database & Auth Setup",
        title: "Define PostgreSQL schema with tags and language enums",
        description: "Set up Supabase tables with Row Level Security allowing private and public snippet sharing.",
        tasks: [
          "Create `snippets` table with id, title, language, code, tags array, and user_id.",
          "Configure RLS policies allowing users to read public snippets and manage their own.",
        ],
      },
      {
        phase: "Phase 2: Code Editor & Highlighting UI",
        title: "Implement syntax-highlighted code viewer and editor",
        description: "Support JavaScript, Python, C++, Go, and SQL with theme selection and copy-to-clipboard feedback.",
        tasks: [
          "Integrate PrismJS or Highlight.js for real-time syntax coloring.",
          "Add copy button with checkmark toast feedback.",
          "Implement client-side search across snippet titles and code content.",
        ],
      },
      {
        phase: "Phase 3: Tag Filtering & Dark Theme",
        title: "Build category filter pills and responsive card layout",
        description: "Ensure smooth mobile layout with tag badges, search shortcut (Cmd+K), and keyboard navigation.",
        tasks: [
          "Add tag search and multi-select filtering.",
          "Implement keyboard shortcut (Cmd+K / Ctrl+K) to focus search bar.",
          "Deploy on Vercel with automated continuous integration.",
        ],
      },
    ],
    starterCode: {
      language: "typescript",
      filename: "SnippetCard.tsx",
      code: `import { useState } from "react";
import { Copy, Check, Code2, Tag } from "lucide-react";

interface SnippetProps {
  title: string;
  language: string;
  code: string;
  tags: string[];
}

export default function SnippetCard({ title, language, code, tags }: SnippetProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="rounded-2xl border border-white/10 bg-black/40 backdrop-blur-xl p-4 text-white shadow-xl">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Code2 className="h-4 w-4 text-[#E3A354]" />
          <h3 className="font-semibold text-sm">{title}</h3>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/10 text-white/70 font-mono">
            {language}
          </span>
        </div>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 transition"
        >
          {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
          <span>{copied ? "Copied!" : "Copy"}</span>
        </button>
      </div>

      <pre className="p-3 rounded-xl bg-black/60 font-mono text-xs overflow-x-auto border border-white/5 text-amber-200/90">
        <code>{code}</code>
      </pre>

      <div className="flex flex-wrap gap-1.5 mt-3">
        {tags.map((t) => (
          <span key={t} className="flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-[#D97D29]/20 text-[#E3A354]">
            <Tag className="h-2.5 w-2.5" />
            {t}
          </span>
        ))}
      </div>
    </div>
  );
}
`,
    },
    recommendedResources: [
      {
        name: "Supabase Database & Authentication",
        url: "https://supabase.com/docs",
        type: "tool",
      },
      {
        name: "PrismJS Syntax Highlighter",
        url: "https://prismjs.com",
        type: "tool",
      },
      {
        name: "Lucide React Modern Icon Library",
        url: "https://lucide.dev",
        type: "tool",
      },
    ],
    resumeBulletPoints: [
      "Engineered a full-stack code snippet vault using Next.js 14, TypeScript, and Supabase PostgreSQL with sub-100ms client-side search.",
      "Implemented Row-Level Security policies safeguarding user-created code assets while facilitating public URL sharing.",
      "Crafted a responsive glassmorphic UI utilizing Tailwind CSS and PrismJS syntax highlighting with one-click clipboard telemetry.",
    ],
  },

  {
    id: "cs-git-vcs-cli",
    title: "Mini-Git: CLI Version Control System from Scratch",
    tagline: "Implement hashing, blob storage, commit trees, and branching in Python or C++.",
    branch: "Computer Science & IT",
    year: "Third Year (TE)",
    difficulty: "Advanced (Semester)",
    estimatedHours: 28,
    skills: ["Python", "Algorithms", "SHA-1", "File I/O", "Data Structures"],
    overview:
      "Understand how Git fundamentally works under the hood by building a functional command-line version control tool from zero. Implement `minigit init`, `add` (creating compressed SHA-1 object blobs), `commit` (directed acyclic graph commit trees), and `log` with visual commit graphs.",
    realWorldImpact:
      "Demystifies DAG graph structures, content-addressable storage, and cryptographic hashing—frequent topics in top-tier FAANG systems interviews.",
    architecture:
      "Command Parser (argparse) -> Content-Addressable Object Store (.minigit/objects) -> Staging Index (.minigit/index) -> Commit Tree Graph.",
    milestones: [
      {
        phase: "Phase 1: Content-Addressable Storage (Blobs & Hashing)",
        title: "Initialize repository directory structure and SHA-1 hashing",
        description: "Store file contents under `.minigit/objects/xx/yyyy...` using SHA-1 hex digests and zlib compression.",
        tasks: [
          "Implement `minigit init` to create hidden directory structure.",
          "Write hash_object function calculating SHA-1 of `blob <length>\\0<data>`.",
          "Save compressed object files using zlib.",
        ],
      },
      {
        phase: "Phase 2: Index Staging & Commit Trees",
        title: "Build staging index and commit tree objects",
        description: "Implement `add` to record staged files and `commit` to record author, timestamp, parent commit hash, and root tree hash.",
        tasks: [
          "Implement `minigit add <file>` modifying binary staging index.",
          "Implement `minigit commit -m <msg>` writing tree object and commit pointer.",
          "Update `HEAD` and `refs/heads/main` pointers.",
        ],
      },
      {
        phase: "Phase 3: Commit History & Branch Checkout",
        title: "Implement `log` and `checkout` branching",
        description: "Walk the commit ancestor chain to display git-log formatting and restore files during checkout.",
        tasks: [
          "Walk commit graph using parent hash links to print history with timestamps.",
          "Implement `minigit checkout <commit-hash>` restoring working directory snapshot.",
        ],
      },
    ],
    starterCode: {
      language: "python",
      filename: "minigit.py",
      code: `import os
import sys
import hashlib
import zlib

GIT_DIR = ".minigit"

def init():
    os.makedirs(f"{GIT_DIR}/objects", exist_ok=True)
    os.makedirs(f"{GIT_DIR}/refs/heads", exist_ok=True)
    with open(f"{GIT_DIR}/HEAD", "w") as f:
        f.write("ref: refs/heads/main\\n")
    print("Initialized empty MiniGit repository in .minigit/")

def hash_object(data: bytes, obj_type="blob", write=True) -> str:
    header = f"{obj_type} {len(data)}\\0".encode('utf-8')
    full_data = header + data
    sha1 = hashlib.sha1(full_data).hexdigest()
    
    if write:
        obj_dir = f"{GIT_DIR}/objects/{sha1[:2]}"
        obj_file = f"{obj_dir}/{sha1[2:]}"
        os.makedirs(obj_dir, exist_ok=True)
        if not os.path.exists(obj_file):
            with open(obj_file, "wb") as f:
                f.write(zlib.compress(full_data))
    return sha1

def add(filename: str):
    if not os.path.exists(filename):
        print(f"Error: {filename} does not exist")
        return
    with open(filename, "rb") as f:
        content = f.read()
    sha1 = hash_object(content, "blob", write=True)
    # Append to simple staging index
    with open(f"{GIT_DIR}/index", "a") as f:
        f.write(f"{sha1} {filename}\\n")
    print(f"Staged {filename} -> Blob {sha1[:7]}")

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python minigit.py [init|add <file>]")
        sys.exit(1)
    cmd = sys.argv[1]
    if cmd == "init":
        init()
    elif cmd == "add" and len(sys.argv) > 2:
        add(sys.argv[2])
    else:
        print("Unknown command")
`,
    },
    recommendedResources: [
      {
        name: "Git from the Inside Out (Mary Rose Cook)",
        url: "https://maryrosecook.com/blog/post/git-from-the-inside-out",
        type: "documentation",
      },
      {
        name: "Pro Git Book: Git Internals",
        url: "https://git-scm.com/book/en/v2/Git-Internals-Plumbing-and-Porcelain",
        type: "documentation",
      },
    ],
    resumeBulletPoints: [
      "Engineered an autonomous CLI Version Control System in Python featuring content-addressable zlib blob storage and SHA-1 cryptographic hashing.",
      "Implemented DAG-based commit tree graph traversal, staging index serialization, and pointer tracking matching Git porcelain specs.",
      "Demonstrated deep systems architecture knowledge of low-level file descriptors, binary payloads, and tree serialization.",
    ],
  },

  // =========================================================================
  // 3. ELECTRONICS, IOT & EMBEDDED SYSTEMS PROJECTS
  // =========================================================================
  {
    id: "iot-smart-library",
    title: "Smart Campus Library Seat & Noise Monitor",
    tagline: "Track study desk occupancy and ambient decibel levels via ESP32 & MQTT dashboard.",
    branch: "Electronics & ENTC",
    year: "Second Year (SE)",
    difficulty: "Intermediate (1-2 Weeks)",
    estimatedHours: 16,
    skills: ["C++", "Arduino", "ESP32", "MQTT", "Sensors", "WebSockets"],
    overview:
      "Students often walk to the library during exams only to find every desk occupied or study rooms noisy. Build an IoT seat monitor using an ESP32 microcontroller, ultrasonic distance sensors, and a digital sound sensor that publishes real-time desk availability and decibel noise levels over MQTT to a live web dashboard.",
    realWorldImpact:
      "Smart campus initiatives use IoT occupancy sensing to balance building HVAC loads and reduce student transit friction by 40%.",
    architecture:
      "ESP32 Microcontroller -> Ultrasonic + Sound Sensors -> WiFi MQTT Broker (HiveMQ) -> Next.js / Web Dashboard with Real-Time Floorplan.",
    milestones: [
      {
        phase: "Phase 1: Sensor Interfacing & Breadboard Prototyping",
        title: "Wire ultrasonic distance sensor and microphone module to ESP32",
        description: "Sample desk distance (threshold < 60cm means seat occupied) and calculate average ambient sound level in decibels.",
        tasks: [
          "Connect HC-SR04 ultrasonic sensor trigger and echo pins with voltage divider.",
          "Wire analog sound level sensor to ESP32 ADC pin.",
          "Filter sensor noise using moving average smoothing.",
        ],
      },
      {
        phase: "Phase 2: MQTT Telemetry Publishing",
        title: "Connect ESP32 to campus WiFi and publish JSON payloads",
        description: "Publish `library/seat_01` state changes (OCCUPIED / FREE) and 10-second sound pressure averages.",
        tasks: [
          "Configure PubSubClient library with free HiveMQ cloud broker.",
          "Publish status payload only on state transitions to conserve power.",
          "Handle WiFi reconnection and heartbeat pings.",
        ],
      },
      {
        phase: "Phase 3: Interactive Floorplan Dashboard",
        title: "Build live web floorplan showing green/red study seats",
        description: "Render an interactive floor map displaying occupied seats, study streaks, and quiet zone noise warnings.",
        tasks: [
          "Subscribe to MQTT topic via WebSocket client in browser.",
          "Color desk SVG green (Available), red (Occupied), or yellow (Noisy).",
        ],
      },
    ],
    starterCode: {
      language: "cpp",
      filename: "esp32_library_monitor.ino",
      code: `#include <WiFi.h>
#include <PubSubClient.h>

const char* ssid = "CAMPUS_WIFI";
const char* password = "WIFI_PASSWORD";
const char* mqtt_server = "broker.hivemq.com";

WiFiClient espClient;
PubSubClient client(espClient);

const int TRIG_PIN = 5;
const int ECHO_PIN = 18;
const int MIC_PIN = 34;

void setup() {
  Serial.begin(115200);
  pinMode(TRIG_PIN, OUTPUT);
  pinMode(ECHO_PIN, INPUT);
  
  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("\\nWiFi Connected!");
  client.setServer(mqtt_server, 1883);
}

long getDistance() {
  digitalWrite(TRIG_PIN, LOW);
  delayMicroseconds(2);
  digitalWrite(TRIG_PIN, HIGH);
  delayMicroseconds(10);
  digitalWrite(TRIG_PIN, LOW);
  long duration = pulseIn(ECHO_PIN, HIGH);
  return duration * 0.034 / 2; // cm
}

void loop() {
  if (!client.connected()) {
    client.connect("StudyBuddyESP32Desk01");
  }
  client.loop();

  long dist = getDistance();
  bool occupied = (dist > 5 && dist < 65);
  int soundRaw = analogRead(MIC_PIN);

  char payload[100];
  snprintf(payload, sizeof(payload), "{\\"desk\\":1,\\"occupied\\":%s,\\"noise_level\\":%d}", 
           occupied ? "true" : "false", soundRaw);
           
  client.publish("studybuddy/library/desk1", payload);
  Serial.println(payload);
  delay(3000);
}
`,
    },
    recommendedResources: [
      {
        name: "HiveMQ Free Public Web MQTT Broker",
        url: "http://www.hivemq.com/demos/websocket-client/",
        type: "tool",
      },
      {
        name: "ESP32 Pinout & ADC Reference Guide",
        url: "https://randomnerdtutorials.com/esp32-pinout-reference-gpios/",
        type: "documentation",
      },
    ],
    resumeBulletPoints: [
      "Engineered an IoT campus study desk occupancy and ambient noise telemetry monitor utilizing ESP32, ultrasonic sensors, and MQTT.",
      "Implemented moving-average noise smoothing and event-driven MQTT state streaming over WebSockets with under 400ms latency.",
      "Designed a real-time web floorplan UI allowing 2,000+ campus students to inspect live quiet-zone availability prior to arriving.",
    ],
  },

  // =========================================================================
  // 4. MECHANICAL & CIVIL ENGINEERING PROJECTS
  // =========================================================================
  {
    id: "mech-truss-fea-solver",
    title: "2D Planar Truss Analysis & Finite Element Deflection Solver",
    tagline: "Calculate nodal displacements, member axial stresses & safety factors via Direct Stiffness Method.",
    branch: "Mechanical Engineering",
    year: "Second Year (SE)",
    difficulty: "Intermediate (1-2 Weeks)",
    estimatedHours: 15,
    skills: ["Python", "NumPy", "Matplotlib", "Finite Element Analysis", "Structural Mechanics"],
    overview:
      "Bridge and crane trusses require rigorous nodal equilibrium analysis. Write a structural engineering solver implementing the Direct Stiffness Matrix method in Python. Calculates global stiffness matrices, nodal displacements under external point loads, member axial forces (Tension vs Compression), and safety factors with animated stress visualizations.",
    realWorldImpact:
      "Foundational principle behind structural engineering packages like ANSYS, SAP2000, and SolidWorks Simulation used in bridge safety certification.",
    architecture:
      "Node & Member Geometry -> Element Stiffness Matrices -> Global Assembly -> Boundary Conditions & Inversion -> Matplotlib Deformed Mesh.",
    milestones: [
      {
        phase: "Phase 1: Coordinate Geometry & Stiffness Matrix",
        title: "Compute local element stiffness for 2D bar elements",
        description: "Formulate transformation matrix [T] and calculate k_local = (EA/L) * [cos, sin; ...] for each truss member.",
        tasks: [
          "Define nodes dictionary (x, y coordinates, support constraints).",
          "Define members list (node_i, node_j, Elastic Modulus E, Cross-Section Area A).",
          "Assemble global stiffness matrix K using index mapping.",
        ],
      },
      {
        phase: "Phase 2: Solving Displacements & Member Forces",
        title: "Solve Ku = F using NumPy linear algebra routines",
        description: "Apply boundary conditions (pinned and roller supports) by eliminating zero-displacement degrees of freedom.",
        tasks: [
          "Partition matrix K into free and constrained partitions.",
          "Solve for unknown nodal displacements with `np.linalg.solve`.",
          "Compute axial internal force N = (EA/L) * delta_L for each bar (identifying Tension vs Compression).",
        ],
      },
      {
        phase: "Phase 3: Visual Deformation & Stress Plot",
        title: "Plot original vs deformed truss structure with color-coded stresses",
        description: "Render deformed truss mesh magnified 100x with Blue (Tension) and Red (Compression) highlighting.",
        tasks: [
          "Overlay original truss in dashed gray and deformed truss in solid lines.",
          "Annotate members with axial stress in MPa and safety factor against yield.",
        ],
      },
    ],
    starterCode: {
      language: "python",
      filename: "truss_solver.py",
      code: `import numpy as np
import matplotlib.pyplot as plt

# 1. Define Nodes (X, Y in meters) and Member Connectivity
nodes = np.array([
    [0.0, 0.0],  # Node 0 (Pin support)
    [4.0, 0.0],  # Node 1
    [8.0, 0.0],  # Node 2 (Roller support)
    [4.0, 3.0],  # Node 3 (Top apex)
])

# Members: [node_start, node_end, Area_m2, E_Pascals]
E = 200e9   # Steel 200 GPa
A = 0.0025  # 25 cm2
members = [
    (0, 1, A, E),
    (1, 2, A, E),
    (0, 3, A, E),
    (1, 3, A, E),
    (2, 3, A, E),
]

n_nodes = len(nodes)
K_global = np.zeros((2 * n_nodes, 2 * n_nodes))

# 2. Assemble Global Stiffness Matrix
for m in members:
    n1, n2, a_val, e_val = m
    dx = nodes[n2, 0] - nodes[n1, 0]
    dy = nodes[n2, 1] - nodes[n1, 1]
    L = np.sqrt(dx**2 + dy**2)
    c, s = dx / L, dy / L
    k_member = (e_val * a_val / L) * np.array([
        [ c*c,  c*s, -c*c, -c*s],
        [ c*s,  s*s, -c*s, -s*s],
        [-c*c, -c*s,  c*c,  c*s],
        [-c*s, -s*s,  c*s,  s*s]
    ])
    dofs = [2*n1, 2*n1+1, 2*n2, 2*n2+1]
    for i in range(4):
        for j in range(4):
            K_global[dofs[i], dofs[j]] += k_member[i, j]

print(f"Assembled {2*n_nodes}x{2*n_nodes} Global Truss Stiffness Matrix successfully!")
`,
    },
    recommendedResources: [
      {
        name: "Direct Stiffness Method MIT OpenCourseWare",
        url: "https://ocw.mit.edu/courses/1-050-engineering-mechanics-i-fall-2007/",
        type: "documentation",
      },
      {
        name: "NumPy Linear Algebra Reference",
        url: "https://numpy.org/doc/stable/reference/routines.linalg.html",
        type: "documentation",
      },
    ],
    resumeBulletPoints: [
      "Developed a 2D Finite Element Truss Analysis engine in Python using the Direct Stiffness Method to solve for nodal displacements and internal axial forces.",
      "Implemented global stiffness matrix assembly, support condition partitioning, and linear algebraic system solving with NumPy.",
      "Visualized deformed structural configurations with automated color-coded tension/compression stress maps and yield safety margins.",
    ],
  },
];

export const ALL_SKILLS_LIST = [
  "Python",
  "Pandas",
  "Scikit-Learn",
  "Streamlit",
  "SHAP",
  "Folium",
  "Matplotlib",
  "Prophet",
  "Plotly",
  "Time-Series",
  "React",
  "Next.js",
  "TypeScript",
  "Tailwind CSS",
  "Supabase",
  "C++",
  "Arduino",
  "ESP32",
  "MQTT",
  "Sensors",
  "NumPy",
  "Finite Element Analysis",
];
