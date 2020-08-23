# Batch convert Images

A simple tool to convert one or many source images into web optimized versions

## Features

- Recursive loading of files inside sub folders
- Support for .jpeg, .png & .webp
- Collage mode to combine multiple images into one

## Usage

1. Clone this repo
2. Run `npm install`
3. Place your images inside the `img` folder. Subdirectories are allowed
4. Adjust the `config.ts` file inside the `src` directory to your liking
5. Run `npm start`

The output will be saved inside the `out` folder. By default `webp` & `jpeg` versions will be created in different sizes
