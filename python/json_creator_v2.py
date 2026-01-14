"""
JSON Creator v2 - Consolidates Japanese word data into a single JSON file
Usage: python json_creator_v2.py

This script will:
1. Download HTML files from the word source
2. Extract and process Japanese words
3. Create a consolidated JSON database
"""

import json
import re
import requests
import os
from typing import Dict, List, Set
from datetime import datetime

def download_html(url: str, filename: str) -> bool:
    """
    Downloads HTML content from a URL and saves it to a file.
    """
    try:
        response = requests.get(url)
        response.raise_for_status()
        
        # Ensure output directory exists
        os.makedirs(os.path.dirname(filename) if os.path.dirname(filename) else '.', exist_ok=True)
        
        with open(filename, 'w', encoding='utf-8') as f:
            f.write(response.text)
        print(f"✓ Downloaded: {url} -> {filename}")
        return True
    except requests.exceptions.RequestException as e:
        print(f"✗ Error downloading {url}: {e}")
        return False

def download_all_sources() -> List[str]:
    """
    Downloads all HTML source files.
    """
    downloaded_files = []
    
    # Create output directory if it doesn't exist
    os.makedirs('output', exist_ok=True)
    
    for version in range(1, 5):  # Downloads versions 1-4
        if version == 1:
            url = 'https://tango.nante-yomu.com/4moji/'
        else:
            url = f'https://tango.nante-yomu.com/4moji-{version}/'
        
        filename = f'output/output{version}.html'
        if download_html(url, filename):
            downloaded_files.append(filename)
    
    return downloaded_files

def process_line(line: str) -> List[str]:
    """
    Processes a single line of HTML to extract words.
    """
    lines = line.split("<br />")
    katakana_pattern = r"[ア-ン]"
    processed = []
    
    for line_part in lines:
        line_part = line_part.strip().replace("<p>", "").replace("</p>", "")
        
        # Skip lines that are too long or don't contain the separator
        if len(line_part) > 50 or '｜' not in line_part:
            continue
        
        # Skip lines with brackets or katakana
        if '[' in line_part or ']' in line_part:
            continue
        
        if re.search(katakana_pattern, line_part):
            continue
        
        processed.append(line_part)
    
    return processed

def extract_words(file_path: str) -> List[List[str]]:
    """
    Extracts Japanese words from an HTML file.
    """
    if not os.path.exists(file_path):
        print(f"Warning: File {file_path} not found")
        return []
    
    print(f"Processing: {file_path}")
    lines = []
    
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
            
            # Find content between styles and footer
            start_marker = '</style>'
            end_marker = '<footer>'
            
            start_idx = content.find(start_marker)
            end_idx = content.find(end_marker)
            
            if start_idx != -1:
                content = content[start_idx + len(start_marker):]
            if end_idx != -1:
                content = content[:end_idx]
            
            # Split into lines and process
            raw_lines = content.split('\n')
            
            for line in raw_lines:
                if '<p>' in line:
                    processed = process_line(line)
                    if processed:
                        lines.append(processed)
    
    except Exception as e:
        print(f"Error processing {file_path}: {e}")
    
    return lines

def calculate_difficulty(kana: str) -> int:
    """
    Calculates word difficulty based on character complexity.
    """
    difficulty = 1.0
    
    dakuten_chars = set('がぎぐげござじずぜぞだぢづでどばびぶべぼ')
    handakuten_chars = set('ぱぴぷぺぽ')
    small_chars = set('ぁぃぅぇぉゃゅょっ')
    
    for char in kana:
        if char in dakuten_chars:
            difficulty += 0.5
        elif char in handakuten_chars:
            difficulty += 0.3
        elif char in small_chars:
            difficulty += 0.2
    
    return min(3, int(difficulty))

def create_consolidated_json(input_files: List[str], output_file: str = 'words_database.json') -> Dict:
    """
    Consolidates all word data into a single JSON file.
    """
    all_words = []
    seen_words: Set[tuple] = set()
    
    for file_path in input_files:
        word_groups = extract_words(file_path)
        
        for word_group in word_groups:
            for word_line in word_group:
                # Clean and parse the word data
                word_line = word_line.replace("'", "").replace('"', '').replace("[", "").replace("]", "")
                
                if '｜' not in word_line:
                    continue
                
                word_parts = word_line.split('｜')
                
                if len(word_parts) >= 2:
                    kana = word_parts[0].strip()
                    kanji = word_parts[-1].strip()
                    
                    # Only add 4-character words
                    if len(kana) == 4:
                        word_tuple = (kana, kanji)
                        
                        # Skip duplicates
                        if word_tuple in seen_words:
                            continue
                        
                        seen_words.add(word_tuple)
                        
                        word_obj = {
                            "kana": kana,
                            "kanji": kanji,
                            "difficulty": calculate_difficulty(kana),
                            "category": "general"
                        }
                        all_words.append(word_obj)
    
    # Sort words by kana
    all_words.sort(key=lambda x: x["kana"])
    
    # Create final structure
    output_data = {
        "words": all_words,
        "metadata": {
            "total_words": len(all_words),
            "last_updated": datetime.now().strftime("%Y-%m-%d"),
            "version": "1.0",
            "source": "tango.nante-yomu.com"
        }
    }
    
    # Write to file
    try:
        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(output_data, f, ensure_ascii=False, indent=2)
        print(f"\n✓ Created {output_file}")
        print(f"  - Total words: {len(all_words)}")
        print(f"  - File size: {os.path.getsize(output_file) / 1024:.2f} KB")
        return output_data
    except Exception as e:
        print(f"\n✗ Error creating JSON file: {e}")
        return {}

def main():
    """
    Main function to orchestrate the entire process.
    """
    print("="*50)
    print("Japanese Wordle - Word Database Creator v2")
    print("="*50)
    
    # Step 1: Download HTML files
    print("\n[Step 1/3] Downloading source files...")
    html_files = download_all_sources()
    
    if not html_files:
        print("✗ No files were downloaded successfully.")
        return
    
    print(f"✓ Downloaded {len(html_files)} files")
    
    # Step 2: Process and extract words
    print("\n[Step 2/3] Extracting words from HTML files...")
    
    # Step 3: Create consolidated JSON
    print("\n[Step 3/3] Creating consolidated JSON database...")
    result = create_consolidated_json(html_files)
    
    if result:
        print("\n" + "="*50)
        print("✓ Success! Database created: words_database.json")
        print("="*50)
        
        # Print some statistics
        if "words" in result:
            print("\nDatabase Statistics:")
            print(f"  - Total 4-character words: {len(result['words'])}")
            
            # Count by difficulty
            difficulty_counts = {}
            for word in result['words']:
                diff = word.get('difficulty', 1)
                difficulty_counts[diff] = difficulty_counts.get(diff, 0) + 1
            
            print("  - By difficulty:")
            for diff in sorted(difficulty_counts.keys()):
                print(f"      Level {diff}: {difficulty_counts[diff]} words")
    else:
        print("\n✗ Failed to create database")

if __name__ == "__main__":
    main()