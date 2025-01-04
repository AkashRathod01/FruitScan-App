from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
import numpy as np
from io import BytesIO
from PIL import Image
import tensorflow as tf
from fastapi.responses import JSONResponse
from tensorflow.keras.preprocessing import image

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["GET", "POST"],
    allow_headers=["*"],
)

MODEL = tf.keras.models.load_model("fruitscan.h5")

CLASS_NAMES = [
    "scab",
    "Black Rot",
    "Cedar rust",
    "Healthy",
    "Powdery Mildew",
    "Healthy",
    "Leaf Scorch",
    "Healthy",
]
FRUITS = [
    "Apple",
    "Apple",
    "Apple",
    "Apple",
    "Cherry",
    "Cherry",
    "Strawberry",
    "Strawberry",
]


@app.get("/ping")
def ping():
    return "Hello, I am alive"


def read_file_as_image(data, target_size=(256, 256)):
    img = Image.open(BytesIO(data))
    img = img.resize(target_size)
    img_array = image.img_to_array(img)
    img_array = np.expand_dims(img_array, axis=0)
    return img_array[0]


@app.post("/predict")
async def result(file: UploadFile = File(...)):
    try:
        contents = await file.read()
        image = read_file_as_image(contents)
        img_batch = np.expand_dims(image, 0)

        predictions = MODEL.predict(img_batch)

        predicted_fruit = FRUITS[np.argmax(predictions[0])]
        predicted_class = CLASS_NAMES[np.argmax(predictions[0])]
        confidence = float(np.max(predictions[0]))

        return {
            "fruit": predicted_fruit,
            "class": predicted_class,
            "confidence": confidence * 100,
        }

    except Exception as e:
        return {"error": str(e)}


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8000)
