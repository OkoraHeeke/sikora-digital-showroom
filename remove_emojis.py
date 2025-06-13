#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Script to remove all emojis from a markdown file while preserving all other content.
Keeps German umlauts and other special characters intact.
"""

import re
import sys
import os


def remove_emojis(text):
    """
    Remove all emojis from text using comprehensive regex patterns.
    Preserves German umlauts and other non-emoji Unicode characters.
    """
    # Comprehensive emoji regex pattern
    emoji_pattern = re.compile(
        "["
        "\U0001F600-\U0001F64F"  # emoticons
        "\U0001F300-\U0001F5FF"  # symbols & pictographs
        "\U0001F680-\U0001F6FF"  # transport & map symbols
        "\U0001F1E0-\U0001F1FF"  # flags (iOS)
        "\U00002500-\U00002BEF"  # chinese char
        "\U00002702-\U000027B0"
        "\U00002702-\U000027B0"
        "\U000024C2-\U0001F251"
        "\U0001f926-\U0001f937"
        "\U00010000-\U0010ffff"
        "\u2640-\u2642"
        "\u2600-\u2B55"
        "\u200d"
        "\u23cf"
        "\u23e9"
        "\u231a"
        "\ufe0f"  # dingbats
        "\u3030"
        "]+",
        flags=re.UNICODE
    )
    
    # Remove emojis but keep spaces where they were
    text_no_emojis = emoji_pattern.sub(' ', text)
    
    # Clean up multiple spaces but preserve intentional formatting
    text_cleaned = re.sub(r' +', ' ', text_no_emojis)
    
    # Clean up spaces at the beginning of lines (but preserve indentation structure)
    lines = text_cleaned.split('\n')
    cleaned_lines = []
    
    for line in lines:
        # Only strip leading spaces if the line starts with removed emoji space
        if line.startswith(' ') and not line.startswith('  '):  # Single space likely from emoji removal
            line = line.lstrip(' ')
        cleaned_lines.append(line)
    
    return '\n'.join(cleaned_lines)


def process_file(input_file, output_file=None):
    """
    Process the markdown file to remove emojis.
    
    Args:
        input_file (str): Path to input markdown file
        output_file (str): Path to output file (if None, overwrites input)
    """
    try:
        # Read the input file
        with open(input_file, 'r', encoding='utf-8') as f:
            content = f.read()
        
        print(f"Original file size: {len(content)} characters")
        
        # Remove emojis
        cleaned_content = remove_emojis(content)
        
        print(f"Cleaned file size: {len(cleaned_content)} characters")
        print(f"Removed: {len(content) - len(cleaned_content)} characters")
        
        # Determine output file
        if output_file is None:
            output_file = input_file
            print(f"Overwriting original file: {input_file}")
        else:
            print(f"Writing to new file: {output_file}")
        
        # Write the cleaned content
        with open(output_file, 'w', encoding='utf-8') as f:
            f.write(cleaned_content)
        
        print("✓ Successfully removed all emojis!")
        return True
        
    except FileNotFoundError:
        print(f"Error: File '{input_file}' not found!")
        return False
    except Exception as e:
        print(f"Error processing file: {e}")
        return False


def main():
    """Main function to handle command line arguments."""
    if len(sys.argv) < 2:
        print("Usage: python remove_emojis.py <input_file> [output_file]")
        print("Examples:")
        print("  python remove_emojis.py ___REPORT.md")
        print("  python remove_emojis.py ___REPORT.md ___REPORT_clean.md")
        sys.exit(1)
    
    input_file = sys.argv[1]
    output_file = sys.argv[2] if len(sys.argv) > 2 else None
    
    # Check if input file exists
    if not os.path.exists(input_file):
        print(f"Error: Input file '{input_file}' does not exist!")
        sys.exit(1)
    
    # Process the file
    success = process_file(input_file, output_file)
    
    if success:
        sys.exit(0)
    else:
        sys.exit(1)


if __name__ == "__main__":
    main() 