import os
from flask import Flask, render_template, request, jsonify, send_file
import base64
from io import BytesIO
from PIL import Image
import numpy as np
import json

app = Flask(__name__)
app.config['SECRET_KEY'] = 'your-secret-key-here'
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024

user_sessions = {}

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/upload', methods=['POST'])
def upload_image():
    try:
        data = request.get_json()
        image_data = data['image'].split(',')[1]
        image_bytes = base64.b64decode(image_data)
        
        import uuid
        session_id = str(uuid.uuid4())
        
        user_sessions[session_id] = {
            'original_image': image_bytes,
            'processed_data': None,
            'steps': [],
            'current_step': 0,
            'generation_params': {}
        }
        
        return jsonify({'success': True, 'session_id': session_id})
    
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)})

@app.route('/initialize_generation', methods=['POST'])
def initialize_generation():
    try:
        data = request.get_json()
        session_id = data['session_id']
        num_pins = int(data.get('numPins', 300))
        num_chords = int(data.get('numChords', 4000))
        line_weight = int(data.get('lineWeight', 20))
        dark_mode = bool(data.get('darkMode', False))
        
        if session_id not in user_sessions:
            return jsonify({'success': False, 'error': 'Session expired'})
        
        # Store generation parameters
        user_sessions[session_id]['generation_params'] = {
            'num_pins': num_pins,
            'num_chords': num_chords,
            'line_weight': line_weight,
            'dark_mode': dark_mode,
            'img_size': 500
        }
        
        # Initialize empty steps
        user_sessions[session_id]['steps'] = []
        user_sessions[session_id]['current_step'] = 0
        
        return jsonify({
            'success': True,
            'message': 'Generation initialized',
            'total_steps': num_chords
        })
    
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)})

@app.route('/next_step', methods=['POST'])
def next_step():
    try:
        data = request.get_json()
        session_id = data['session_id']
        
        if session_id not in user_sessions:
            return jsonify({'success': False, 'error': 'Session expired'})
        
        session = user_sessions[session_id]
        params = session['generation_params']
        current_step = session['current_step']
        
        if current_step >= params['num_chords']:
            return jsonify({
                'success': True,
                'completed': True,
                'message': 'All steps completed'
            })
        
        # Generate next step (simplified - in real implementation, compute actual string art step)
        from_step = current_step % params['num_pins']
        to_step = (current_step + 1) % params['num_pins']
        
        new_step = {
            'from': from_step,
            'to': to_step,
            'step_number': current_step + 1
        }
        
        session['steps'].append(new_step)
        session['current_step'] += 1
        
        return jsonify({
            'success': True,
            'completed': False,
            'step': new_step,
            'current_step': session['current_step'],
            'total_steps': params['num_chords']
        })
    
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)})

@app.route('/get_all_steps', methods=['GET'])
def get_all_steps():
    try:
        session_id = request.args.get('session_id')
        if not session_id or session_id not in user_sessions:
            return jsonify({'success': False, 'error': 'Session expired'})
        
        session = user_sessions[session_id]
        return jsonify({
            'success': True,
            'steps': session['steps'],
            'current_step': session['current_step'],
            'total_steps': session['generation_params']['num_chords']
        })
    
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)})

@app.route('/download/steps')
def download_steps():
    try:
        session_id = request.args.get('session_id')
        if not session_id or session_id not in user_sessions:
            return "No steps available", 400
        
        steps = user_sessions[session_id].get('steps', [])
        content = "String Art Steps:\n"
        for step in steps:
            content += f"{step['step_number']}: From Pin {step['from']} to Pin {step['to']}\n"
        
        return send_file(
            BytesIO(content.encode()),
            as_attachment=True,
            download_name='string_art_steps.txt',
            mimetype='text/plain'
        )
    
    except Exception as e:
        return str(e), 500

@app.route('/download/svg')
def download_svg():
    try:
        session_id = request.args.get('session_id')
        dark_mode = request.args.get('darkMode', 'false') == 'true'
        
        if not session_id or session_id not in user_sessions:
            return "No SVG available", 400
        
        session = user_sessions[session_id]
        steps = session.get('steps', [])
        params = session.get('generation_params', {})
        num_pins = params.get('num_pins', 300)
        img_size = params.get('img_size', 500)
        
        # Generate pin coordinates
        pin_coords = generate_pin_coords(num_pins, img_size)
        
        # Generate SVG
        bg_color = "#333" if dark_mode else "#fff"
        stroke_color = "rgba(255, 255, 255, 0.5)" if dark_mode else "#000"
        
        svg_content = f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {img_size} {img_size}" width="{img_size}" height="{img_size}">
            <rect width="100%" height="100%" fill="{bg_color}"/>'''
        
        for step in steps:
            p_from = pin_coords[step['from']]
            p_to = pin_coords[step['to']]
            svg_content += f'<line x1="{p_from[0]}" y1="{p_from[1]}" x2="{p_to[0]}" y2="{p_to[1]}" stroke="{stroke_color}" stroke-width="0.5" />'
        
        svg_content += '</svg>'
        
        return send_file(
            BytesIO(svg_content.encode()),
            as_attachment=True,
            download_name='string_art.svg',
            mimetype='image/svg+xml'
        )
    
    except Exception as e:
        return str(e), 500

def generate_pin_coords(num_pins, img_size):
    center = img_size / 2
    radius = center - 1
    coords = []
    for i in range(num_pins):
        angle = (2 * np.pi * i) / num_pins
        x = center + radius * np.cos(angle)
        y = center + radius * np.sin(angle)
        coords.append((x, y))
    return coords

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)