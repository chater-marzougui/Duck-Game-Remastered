from flask import Flask, request, jsonify
from flask_cors import CORS
import json
import os

app = Flask(__name__)
CORS(app)

leaderboard_file = 'leaderboard.json'

# Ensure leaderboard file exists
if not os.path.exists(leaderboard_file):
    with open(leaderboard_file, 'w') as file:
        json.dump({"bestScore": 1, "entries": []}, file)

@app.route('/submit-score', methods=['POST'])
def submit_score():
    data = request.json
    SB = data['SB']
    userName = data['userName']
    theMessage = data['theMessage']
    theScore = int(data['theScore'])

    with open(leaderboard_file, 'r') as file:
        leaderboard = json.load(file)

    # Update best score if necessary
    if theScore > leaderboard["bestScore"]:
        leaderboard["bestScore"] = theScore

    # Add new entry
    leaderboard["entries"].append({
        "SB": SB,
        "userName": userName,
        "theMessage": theMessage,
        "theScore": theScore
    })
    # Sort entries by score
    leaderboard["entries"].sort(key=lambda entry: entry["theScore"], reverse=True)

    with open(leaderboard_file, 'w') as file:
        json.dump(leaderboard, file)

    return 'Score submitted successfully!', 200

@app.route('/leaderboard', methods=['GET'])
def get_leaderboard():
    with open(leaderboard_file, 'r') as file:
        leaderboard = json.load(file)
        leaderboard["entries"].sort(key=lambda entry: entry["theScore"], reverse=True)
    return jsonify(leaderboard)

if __name__ == '__main__':
    app.run(debug=True)
