"""
OrangeAI — Model Training Script (Corrected & Production Ready)
================================================================
ResNet-50 Transfer Learning for Orange Disease Detection

HOW TO RUN:
    cd D:\\orangeai\\backend
    venv\\Scripts\\activate
    python ml/train.py

REQUIREMENTS:
    pip install tensorflow numpy pillow scikit-learn matplotlib seaborn h5py

DATASET STRUCTURE:
    backend/dataset/
        citrus_canker/   (200+ images)
        hlb/             (200+ images)
        black_spot/      (200+ images)
        root_rot/        (100+ images)
        melanose/        (150+ images)
        sooty_mould/     (130+ images)
        tristeza/        (100+ images)
        scab/            (140+ images)
        healthy/         (300+ images)
"""

import os
import sys
import json
import numpy as np
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
import warnings
warnings.filterwarnings("ignore")

# Pre-flight checks
print("\n" + "="*60)
print("  OrangeAI — Model Training Script")
print("="*60)

try:
    import tensorflow as tf
    print(f"\n  TensorFlow : {tf.__version__}")
except ImportError:
    print("\n  ERROR: TensorFlow not installed!")
    print("  Run: pip install tensorflow")
    sys.exit(1)

missing = []
for pkg in ["sklearn", "seaborn", "PIL"]:
    try:
        __import__(pkg if pkg != "PIL" else "PIL.Image")
    except ImportError:
        missing.append(pkg.replace("sklearn","scikit-learn").replace("PIL","Pillow"))

if missing:
    print(f"\n  ERROR: Missing packages: {', '.join(missing)}")
    print(f"  Run: pip install {' '.join(missing)}")
    sys.exit(1)

from tensorflow.keras.applications import ResNet50
from tensorflow.keras.layers import Dense, GlobalAveragePooling2D, Dropout, BatchNormalization
from tensorflow.keras.models import Model
from tensorflow.keras.optimizers import Adam
from tensorflow.keras.preprocessing.image import ImageDataGenerator
from tensorflow.keras.callbacks import ModelCheckpoint, EarlyStopping, ReduceLROnPlateau, TensorBoard
from sklearn.metrics import classification_report, confusion_matrix
import seaborn as sns

# Config
IMG_SIZE    = (224, 224)
BATCH_SIZE  = 32
EPOCHS_P1   = 20
EPOCHS_P2   = 30
LR_P1       = 1e-3
LR_P2       = 1e-5
DATASET_DIR = "./dataset"
OUTPUT_DIR  = "./ml/saved_model"

ALL_CLASS_NAMES = [
    "citrus_canker", "hlb", "black_spot", "root_rot",
    "melanose", "sooty_mould", "tristeza", "scab", "healthy",
]

# Auto-detect available classes
print(f"\n  Scanning dataset: {os.path.abspath(DATASET_DIR)}\n")

if not os.path.exists(DATASET_DIR):
    print(f"  ERROR: dataset/ not found!")
    print("  Run from backend/ folder: cd D:\\orangeai\\backend")
    sys.exit(1)

available_classes = []
skipped_classes   = []

for cls in ALL_CLASS_NAMES:
    cls_path = os.path.join(DATASET_DIR, cls)
    if os.path.exists(cls_path):
        imgs = [f for f in os.listdir(cls_path)
                if f.lower().endswith((".jpg",".jpeg",".png",".webp",".bmp"))]
        if len(imgs) >= 10:
            available_classes.append(cls)
            print(f"  OK  {cls:<20} {len(imgs):>4} images")
        else:
            skipped_classes.append(cls)
            print(f"  SKIP {cls:<20} {len(imgs):>4} images (need 10+)")
    else:
        skipped_classes.append(cls)
        print(f"  MISS {cls:<20} folder not found")

NUM_CLASSES = len(available_classes)
CLASS_NAMES = available_classes

print(f"\n  Classes for training: {NUM_CLASSES}")

if NUM_CLASSES < 2:
    print("\n  ERROR: Need at least 2 classes. Add more images.")
    sys.exit(1)

if skipped_classes:
    print(f"  Skipped: {skipped_classes}\n")

input("\n  Press ENTER to start training... (Ctrl+C to cancel)\n")

# Create output directories safely
import shutil
for d in [OUTPUT_DIR, "./logs"]:
    if os.path.exists(d) and not os.path.isdir(d):
        os.remove(d)   # remove if it's a file, not a folder
    os.makedirs(d, exist_ok=True)

# Data generators
train_datagen = ImageDataGenerator(
    rescale             = 1.0/255,
    rotation_range      = 40,
    width_shift_range   = 0.2,
    height_shift_range  = 0.2,
    shear_range         = 0.2,
    zoom_range          = 0.25,
    horizontal_flip     = True,
    vertical_flip       = False,
    brightness_range    = [0.7, 1.3],
    channel_shift_range = 15.0,
    fill_mode           = "nearest",
    validation_split    = 0.2,
)

val_datagen = ImageDataGenerator(
    rescale          = 1.0/255,
    validation_split = 0.2,
)

train_gen = train_datagen.flow_from_directory(
    DATASET_DIR,
    target_size = IMG_SIZE,
    batch_size  = BATCH_SIZE,
    class_mode  = "categorical",
    classes     = CLASS_NAMES,
    subset      = "training",
    shuffle     = True,
    seed        = 42,
)

val_gen = val_datagen.flow_from_directory(
    DATASET_DIR,
    target_size = IMG_SIZE,
    batch_size  = BATCH_SIZE,
    class_mode  = "categorical",
    classes     = CLASS_NAMES,
    subset      = "validation",
    shuffle     = False,
)

print(f"\n  Training samples   : {train_gen.samples}")
print(f"  Validation samples : {val_gen.samples}")
print(f"  Classes            : {CLASS_NAMES}\n")

if train_gen.samples == 0:
    print("  ERROR: No images found. Check folder structure.")
    sys.exit(1)

# Model architecture
def build_model(num_classes, trainable_base=False):
    base = ResNet50(weights="imagenet", include_top=False, input_shape=(*IMG_SIZE,3))
    base.trainable = trainable_base
    x = base.output
    x = GlobalAveragePooling2D()(x)
    x = BatchNormalization()(x)
    x = Dense(512, activation="relu", kernel_regularizer=tf.keras.regularizers.l2(1e-4))(x)
    x = Dropout(0.5)(x)
    x = Dense(256, activation="relu", kernel_regularizer=tf.keras.regularizers.l2(1e-4))(x)
    x = Dropout(0.3)(x)
    out = Dense(num_classes, activation="softmax")(x)
    return Model(inputs=base.input, outputs=out)

def make_callbacks(phase):
    return [
        ModelCheckpoint(f"{OUTPUT_DIR}/best_p{phase}.keras",
                        save_best_only=True, monitor="val_accuracy", verbose=1),
        EarlyStopping(patience=8, restore_best_weights=True,
                      monitor="val_accuracy", verbose=1),
        ReduceLROnPlateau(factor=0.3, patience=4, min_lr=1e-8, verbose=1),
        TensorBoard(log_dir=f"./logs/phase{phase}", histogram_freq=0),
    ]

# Phase 1
print("="*60)
print("  PHASE 1: Training head (base frozen)")
print("="*60)

model = build_model(NUM_CLASSES, trainable_base=False)
model.compile(optimizer=Adam(LR_P1), loss="categorical_crossentropy", metrics=["accuracy"])
print(f"  Total params     : {model.count_params():,}\n")

try:
    h1 = model.fit(train_gen, validation_data=val_gen,
                   epochs=EPOCHS_P1, callbacks=make_callbacks(1), verbose=1)
except KeyboardInterrupt:
    print("\n  Interrupted."); sys.exit(0)
except Exception as e:
    if "OOM" in str(e) or "memory" in str(e).lower():
        print("\n  ERROR: Out of memory! Change BATCH_SIZE = 16 in train.py")
    else:
        print(f"\n  ERROR: {e}")
    sys.exit(1)

# Phase 2
print("\n" + "="*60)
print("  PHASE 2: Fine-tuning all layers")
print("="*60 + "\n")

for layer in model.layers:
    layer.trainable = True

model.compile(optimizer=Adam(LR_P2), loss="categorical_crossentropy", metrics=["accuracy"])

try:
    h2 = model.fit(train_gen, validation_data=val_gen,
                   epochs=EPOCHS_P1+EPOCHS_P2, initial_epoch=EPOCHS_P1,
                   callbacks=make_callbacks(2), verbose=1)
except KeyboardInterrupt:
    print("\n  Fine-tuning interrupted. Saving current model...")
    h2 = None
except Exception as e:
    print(f"\n  Phase 2 error: {e}")
    h2 = None

# Evaluate
print("\n  Evaluating...")
loss, acc = model.evaluate(val_gen, verbose=0)
print(f"\n  Validation Accuracy : {acc*100:.2f}%")
print(f"  Validation Loss     : {loss:.4f}")

if acc < 0.60:
    print("\n  Low accuracy tips:")
    print("  - Need 100+ images per class")
    print("  - Check images are in correct folders")
    print("  - Try reducing BATCH_SIZE to 16")

# Confusion matrix
try:
    y_pred     = np.argmax(model.predict(val_gen, verbose=0), axis=1)
    y_true     = val_gen.classes
    idx_to_cls = {v: k for k, v in val_gen.class_indices.items()}
    labels     = [idx_to_cls[i] for i in range(NUM_CLASSES)]

    print("\n  Classification Report:")
    print(classification_report(y_true, y_pred, target_names=labels))

    cm = confusion_matrix(y_true, y_pred)
    fig, ax = plt.subplots(figsize=(max(8,NUM_CLASSES+2), max(6,NUM_CLASSES)))
    sns.heatmap(cm, annot=True, fmt="d", cmap="Oranges",
                xticklabels=labels, yticklabels=labels, ax=ax)
    ax.set_title("OrangeAI — Confusion Matrix", fontsize=14, pad=16)
    ax.set_ylabel("True Label"); ax.set_xlabel("Predicted Label")
    plt.xticks(rotation=45, ha="right"); plt.tight_layout()
    plt.savefig(f"{OUTPUT_DIR}/confusion_matrix.png", dpi=150); plt.close()
    print(f"  Saved confusion matrix → {OUTPUT_DIR}/confusion_matrix.png")
except Exception as e:
    print(f"  Warning: confusion matrix failed: {e}")

# Training curves
try:
    all_acc      = h1.history["accuracy"]
    all_val_acc  = h1.history["val_accuracy"]
    all_loss     = h1.history["loss"]
    all_val_loss = h1.history["val_loss"]
    if h2:
        all_acc      += h2.history["accuracy"]
        all_val_acc  += h2.history["val_accuracy"]
        all_loss     += h2.history["loss"]
        all_val_loss += h2.history["val_loss"]

    fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(14, 5))
    ax1.plot(all_acc, label="Train", color="#F97316")
    ax1.plot(all_val_acc, label="Val", color="#0F6E56")
    ax1.axvline(EPOCHS_P1, color="gray", linestyle="--", alpha=0.7, label="Phase 2")
    ax1.set_title("Accuracy"); ax1.legend(); ax1.grid(alpha=0.3)

    ax2.plot(all_loss, label="Train", color="#F97316")
    ax2.plot(all_val_loss, label="Val", color="#0F6E56")
    ax2.axvline(EPOCHS_P1, color="gray", linestyle="--", alpha=0.7, label="Phase 2")
    ax2.set_title("Loss"); ax2.legend(); ax2.grid(alpha=0.3)

    plt.suptitle("OrangeAI — Training History", fontsize=14)
    plt.tight_layout()
    plt.savefig(f"{OUTPUT_DIR}/training_curves.png", dpi=120); plt.close()
    print(f"  Saved training curves → {OUTPUT_DIR}/training_curves.png")
except Exception as e:
    print(f"  Warning: curves failed: {e}")

# Save model
final_path = f"{OUTPUT_DIR}/orange_disease_resnet50.h5"
try:
    model.save(final_path)
    size_mb = os.path.getsize(final_path) / (1024*1024)
    print(f"\n  Model saved → {final_path} ({size_mb:.1f} MB)")
except Exception as e:
    print(f"  .h5 save failed: {e}. Trying SavedModel format...")
    model.save(f"{OUTPUT_DIR}/orange_disease_resnet50")
    print(f"  Saved as SavedModel format.")

with open(f"{OUTPUT_DIR}/labels.json", "w") as f:
    json.dump({
        "labels"        : CLASS_NAMES,
        "num_classes"   : NUM_CLASSES,
        "accuracy"      : float(acc),
        "loss"          : float(loss),
        "img_size"      : list(IMG_SIZE),
        "class_indices" : train_gen.class_indices,
    }, f, indent=2)
print(f"  Labels saved  → {OUTPUT_DIR}/labels.json")

print("\n" + "="*60)
print("  Training Complete!")
print("="*60)
print(f"\n  Classes   : {NUM_CLASSES}")
print(f"  Accuracy  : {acc*100:.2f}%")
print(f"  Model     : {final_path}")
print(f"\n  Next: restart backend:")
print(f"  uvicorn main:app --reload --port 8000\n")