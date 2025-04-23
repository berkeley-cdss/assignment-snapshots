module Constants
  DATA_PROCESSOR = <<PY
  """
  This module provides functions for processing and analyzing datasets.
  """

  import pandas as pd
  import numpy as np

  def load_data(file_path):
      """Loads data from a CSV file into a pandas DataFrame."""
      try:
          df = pd.read_csv(file_path)
          print(f"Data loaded successfully from: {file_path}")
          return df
      except FileNotFoundError:
          print(f"Error: File not found at {file_path}")
          return None

  def calculate_mean(df, column):
      """Calculates the mean of a specified column in a DataFrame."""
      if column in df.columns:
          return df[column].mean()
      else:
          print(f"Error: Column '{column}' not found in DataFrame.")
          return None

  def filter_data(df, column, threshold):
      """Filters a DataFrame to include rows where the specified column exceeds a threshold."""
      if column in df.columns:
          return df[df[column] > threshold]
      else:
          print(f"Error: Column '{column}' not found in DataFrame.")
          return None

  if __name__ == "__main__":
      data = {'ID': [1, 2, 3, 4, 5],
              'Value': [10, 25, 15, 30, 20],
              'Category': ['A', 'B', 'A', 'C', 'B']}
      sample_df = pd.DataFrame(data)

      print("\nSample DataFrame:")
      print(sample_df)

      mean_value = calculate_mean(sample_df, 'Value')
      print(f"\nMean of 'Value': {mean_value}")

      filtered_df = filter_data(sample_df, 'Value', 18)
      print("\nDataFrame after filtering 'Value' > 18:")
      print(filtered_df)
PY

  WEB_SCRAPER = <<PY
  """
  This script scrapes data from a specified URL.
  """

  import requests
  from bs4 import BeautifulSoup

  def fetch_url(url):
      """Fetches the content of a given URL."""
      try:
          response = requests.get(url)
          response.raise_for_status()  # Raise an exception for bad status codes
          return response.text
      except requests.exceptions.RequestException as e:
          print(f"Error fetching URL '{url}': {e}")
          return None

  def parse_html(html_content, target_class):
      """Parses HTML content and extracts text from elements with a specific class."""
      soup = BeautifulSoup(html_content, 'html.parser')
      results = soup.find_all(class_=target_class)
      return [item.get_text(strip=True) for item in results]

  if __name__ == "__main__":
      target_url = "https://www.example.com/news"  # Just a placeholder
      target_class = "article-headline"

      html = fetch_url(target_url)
      if html:
          headlines = parse_html(html, target_class)
          if headlines:
              print(f"Headlines from {target_url}:")
              for headline in headlines:
                  print(f"- {headline}")
          else:
              print(f"No elements found with class '{target_class}' on {target_url}.")
PY

  GAME_LOGIC = <<PY
  """
  This module defines the logic for a simple number guessing game.
  """

  import random

  def generate_secret_number(min_val, max_val):
      """Generates a random secret number within a specified range."""
      return random.randint(min_val, max_val)

  def check_guess(secret_number, guess):
      """Checks if the player's guess is correct and provides feedback."""
      if guess < secret_number:
          return "Too low!"
      elif guess > secret_number:
          return "Too high!"
      else:
          return "Congratulations! You guessed the number!"

  def play_game(min_range=1, max_range=100):
      """Starts and manages the number guessing game."""
      secret = generate_secret_number(min_range, max_range)
      attempts = 0

      print(f"Welcome to the Number Guessing Game!")
      print(f"I'm thinking of a number between {min_range} and {max_range}.")

      while True:
          try:
              player_guess = int(input("Enter your guess: "))
              attempts += 1
              feedback = check_guess(secret, player_guess)
              print(feedback)
              if feedback == "Congratulations! You guessed the number!":
                  break
          except ValueError:
              print("Invalid input. Please enter a whole number.")

  if __name__ == "__main__":
      play_game()
PY

  AUTOGRADER_OUTPUT = <<OKPY
  Running OkPy...
  OkPy complete...
  =====================================================================
  Assignment: Project 1: Yelp Maps
  OK, version v1.18.1
  =====================================================================

  ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
  Scoring tests

  ---------------------------------------------------------------------
  Problem 0 Utils > Suite 1 > Case 1

  >>> from utils import *
  >>> square = lambda x: x * x
  >>> is_odd = lambda x: x % 2 == 1
  >>> map_and_filter([1, 2, 3, 4, 5], square, is_odd)
  [1, 9, 25]
  >>> map_and_filter(['hi', 'hello', 'hey', 'world'],
  ...                lambda x: x[4], lambda x: len(x) > 4)
  ['o', 'd']
  -- OK! --

  ---------------------------------------------------------------------
  Problem 0 Utils > Suite 1 > Case 2

  >>> from utils import *
  >>> key_of_min_value({1: 6, 2: 5, 3: 4})
  3
  >>> key_of_min_value({'a': 6, 'b': 5, 'c': 4})
  'c'
  >>> key_of_min_value({'hello': 'world', 'hi': 'there'})
  'hi'
  -- OK! --

  ---------------------------------------------------------------------
  Problem 0 Utils > Suite 1 > Case 3

  >>> from utils import *
  >>> enumerate([6, 'one', 'a'], 3)[1]
  [4, 'one']
  -- OK! --

  ---------------------------------------------------------------------
  Problem 0 Utils
      Passed: 1
      Failed: 0
  [ooooooooook] 100.0% passed
OKPY
end
