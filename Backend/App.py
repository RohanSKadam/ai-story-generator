from pymongo import MongoClient
from flask_cors import CORS
from flask import Flask, request, jsonify
from werkzeug.utils import secure_filename
import os
from PIL import Image
import openai

app = Flask(__name__)
CORS(app)
client = MongoClient("mongodb://localhost:27017/")
db = client["ai_story_generator"]
history_collection = db["history"]
# Set up OpenAI API key
openai.api_key = "Use your api key"

@app.route('/generate', methods=['POST'])
def generate():
    data = request.get_json()
    prompt = data.get('prompt', '')

    if not prompt:
        return jsonify({'error': 'Prompt is required'}), 400

    try:
        response = openai.Completion.create(
            engine="text-davinci-003",
            prompt=prompt,
            max_tokens=300,
            temperature=0.7
        )
        story = response.choices[0].text.strip()
        history_collection.insert_one({'prompt': prompt, 'story': story})
        return jsonify({'story': story})
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    
@app.route('/history', methods=['GET'])
def history():
    records = list(history_collection.find({}, {"_id": 0}))
    return jsonify({'history': records})

UPLOAD_FOLDER = 'uploads'
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

@app.route('/upload-image', methods=['POST'])
def upload_image():
    if 'image' not in request.files:
        return jsonify({'error': 'No image uploaded'}), 400

    image = request.files['image']
    if image.filename == '':
        return jsonify({'error': 'No selected file'}), 400

    filename = secure_filename(image.filename)
    filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
    image.save(filepath)

    # (Optional) Process the image here, e.g., resize or pass it to OpenAI
    img = Image.open(filepath)
    img.thumbnail((512, 512))  # Example processing
    img.save(filepath)

    return jsonify({'message': 'Image uploaded successfully', 'file_path': filepath})

if __name__ == '__main__':
    app.run(debug=True)
