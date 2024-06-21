from flask import Flask, request, jsonify
from flask_cors import CORS
import os

app = Flask(__name__)
CORS(app)

@app.route('/save_coordinates', methods=['POST'])
def save_coordinates():
    data = request.json
    coordinates = data.get('coordinates')
    
    if not coordinates:
        return jsonify({"status": "error", "message": "No coordinates provided"}), 400

    try:
        file_path = os.path.join('coordinates.txt')
        with open(file_path, 'w') as file:
            file.write(str(coordinates))
        return jsonify({"status": "success", "message": "Coordinates saved successfully"})
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)
