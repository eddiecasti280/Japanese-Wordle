import json
import re
from typing import Dict, List

def create_consolidated_json(input_files: List[str], output_file: str = 'words_database.json'):
    """
    Consolidates all word data into a single JSON file
    """
    all_words = []
    
    for file_path in input_files:
        words = extract_words(file_path)
        
        for word_group in words:
            for word_line in word_group:
                # Parse the word data
                word_parts = word_line.replace("'", "").replace("[", "").replace("]", "").split('｜')
                
                if len(word_parts) >= 2:
                    word_obj = {
                        "kana": word_parts[0].strip(),
                        "kanji": word_parts[-1].strip(),
                        "difficulty": calculate_difficulty(word_parts[0]),
                        "category": "general"
                    }
                    
                    # Only add 4-character words
                    if len(word_obj["kana"]) == 4:
                        all_words.append(word_obj)
    
    # Remove duplicates
    seen = set()
    unique_words = []
    for word in all_words:
        word_tuple = (word["kana"], word["kanji"])
        if word_tuple not in seen:
            seen.add(word_tuple)
            unique_words.append(word)
    
    # Create final structure
    output_data = {
        "words": unique_words,
        "metadata": {
            "total_words": len(unique_words),
            "last_updated": "2024-01-01",
            "version": "1.0"
        }
    }
    
    # Write to file
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(output_data, f, ensure_ascii=False, indent=2)
    
    print(f"Created {output_file} with {len(unique_words)} words")
    return output_data

def calculate_difficulty(kana: str) -> int:
    """
    Calculate word difficulty based on character complexity
    """
    # Simple difficulty calculation based on presence of dakuten, etc.
    difficulty = 1
    
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
    
    return min(3, int(difficulty))  # Cap at difficulty 3