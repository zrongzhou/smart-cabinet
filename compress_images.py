#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Image Compression Script for Smart Cabinet v241 Performance Optimization
Compresses all JPEG/PNG images in public/images/ directory
"""
import os
from PIL import Image

BASE_DIR = "D:/workbuddy/2026-06-19-13-21-39/smart-cabinet-local/public"

def compress_image(filepath, quality=82):
    """Compress a single image file"""
    try:
        img = Image.open(filepath)
        
        # Get original size
        original_size = os.path.getsize(filepath)
        
        # Compress and save
        img.save(filepath, quality=quality, optimize=True)
        
        # Get new size
        new_size = os.path.getsize(filepath)
        reduction = (1 - new_size / original_size) * 100
        
        print(f"OK {os.path.basename(filepath)}: {original_size/1024:.1f}KB -> {new_size/1024:.1f}KB ({reduction:.1f}% reduction)")
        
        return original_size, new_size
    except Exception as e:
        print(f"ERROR Error compressing {filepath}: {e}")
        return 0, 0

def main():
    total_original = 0
    total_compressed = 0
    
    print("=" * 60)
    print("Smart Cabinet v241 - Image Compression Script")
    print("=" * 60)
    print()
    
    # Compress images in about/ directory
    about_dir = os.path.join(BASE_DIR, "images/about")
    if os.path.exists(about_dir):
        print(f"Folder: Compressing about/ images...")
        for filename in os.listdir(about_dir):
            if filename.lower().endswith(('.jpg', '.jpeg', '.png')):
                filepath = os.path.join(about_dir, filename)
                orig, new = compress_image(filepath)
                total_original += orig
                total_compressed += new
        print()
    
    # Compress images in blog/ directory
    blog_dir = os.path.join(BASE_DIR, "images/blog")
    if os.path.exists(blog_dir):
        print(f"Folder: Compressing blog/ images...")
        for filename in os.listdir(blog_dir):
            if filename.lower().endswith(('.jpg', '.jpeg', '.png')):
                filepath = os.path.join(blog_dir, filename)
                orig, new = compress_image(filepath)
                total_original += orig
                total_compressed += new
        print()
    
    # Compress images in products/ directory (but NOT deleting full variants yet)
    products_dir = os.path.join(BASE_DIR, "images/products")
    if os.path.exists(products_dir):
        print(f"Folder: Compressing products/ images...")
        for filename in os.listdir(products_dir):
            if filename.lower().endswith(('.jpg', '.jpeg', '.png')) and '-full' not in filename:
                filepath = os.path.join(products_dir, filename)
                orig, new = compress_image(filepath)
                total_original += orig
                total_compressed += new
        print()
    
    # Delete *-full.jpg files (redundant large images)
    if os.path.exists(products_dir):
        print(f"Delete: Deleting redundant *-full.jpg images...")
        for filename in os.listdir(products_dir):
            if filename.lower().endswith('-full.jpg'):
                filepath = os.path.join(products_dir, filename)
                size = os.path.getsize(filepath)
                os.remove(filepath)
                print(f"OK Deleted {filename} ({size/1024:.1f}KB)")
        print()
    
    # Summary
    print("=" * 60)
    print("COMPRESSION SUMMARY")
    print("=" * 60)
    if total_original > 0:
        total_reduction = (1 - total_compressed / total_original) * 100
        print(f"Total original size: {total_original/1024/1024:.2f} MB")
        print(f"Total compressed size: {total_compressed/1024/1024:.2f} MB")
        print(f"Total reduction: {total_reduction:.1f}%")
    else:
        print("No images found to compress.")
    print("=" * 60)

if __name__ == "__main__":
    main()
