import pandas as pd

# Load the CSV file
df = pd.read_csv('../data/players_all_preprocessed.csv')

# Filter rows where 'fifa_version' is greater than or equal to 20
filtered_df = df[df['fifa_version'] >= 20]

# Save the filtered data to a new CSV file
filtered_df.to_csv('../data/players_all_preprocessed2.csv', index=False)