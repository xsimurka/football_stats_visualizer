import pandas as pd

# Example usage
csv_file = "./public/data/players_all_preprocessed.csv"  # Replace with the actual path to your dataset
df = pd.read_csv(csv_file)



def get_unique_league_names(df):
    try:
        # Check if the column exists in the dataset
        if 'league_name' not in df.columns:
            raise KeyError("The 'league_name' column is not found in the dataset.")

        # Extract the 'league_name' column and get unique values as a set
        unique_leagues = set(df['league_name'].dropna())

        return unique_leagues
    except Exception as e:
        print(f"An error occurred: {e}")
        return set()

leagues = {'Superliga': 'Denmark',
           'Liga 1': "Romania",
           'Ligue 1': 'France',
           'Primera Division': "Peru",
           'Liga Profesional': "Argentina",
#           'Premier League': "United Kingdom, Ukraine, Russia, South Africa",
           'J-League': "Japan",
#           'Bundesliga': "Germany, Austria",
           'Allsvenskan': "Sweden",
           'Ekstraklasa': "Poland",
           'Eliteserien': "Norway",
           'Liga BetPlay': "Colombia",
           'Liga MX': "Mexico",
           'Ligue 2': 'France',
           'Eredivisie': "Netherlands",
           'K League 1': "South Korea",
           'Premier Division': "Republic of Ireland",
           'Veikkausliiga': "Finland",
           '2. Bundesliga': "Germany",
           'Primera División': "Paraguay",
           'Liga De Futbol Prof': "Bolivia",
           'Premiership': "United Kingdom",
           'Major League Soccer': "United States of America",
           'League One': "United Kingdom",
 #          'Super League': "China, Switzerland, India, Greece",
           '3. Liga': "Germany",
           'Super Lig': "Turkey",
           '1. HNL': "Croatia",
           'La Liga': "Spain",
           'Fortuna Liga': "Czech Republic",
           'Liga Portugal': 'Portugal',
  #         'Serie A': 'Italy, Brasil',
           'Liga Pro': "Ecuador",
           'Jupiler Pro League': "Belgium",
           '1. Division': "Cyprus",
           'Serie B': "Italy",
           'NB I.': "Hungary",
           'Championship': "United Kingdom",
           'Pro League': "Saudi Arabia",
           'A-League': "Australia",
           'League Two': "United Kingdom",
           'La Liga 2': "Spain"}


def get_clubs_in_league(df, target_league_name):
    try:

        # Check if the required columns exist in the dataset
        if 'league_name' not in df.columns or 'club_name' not in df.columns:
            raise KeyError("The dataset must contain 'league_name' and 'club_name' columns.")

        # Filter the DataFrame for the target league and extract unique club names
        clubs = set(df.loc[df['league_name'] == target_league_name, 'club_name'].dropna())

        return clubs
    except Exception as e:
        print(f"An error occurred: {e}")
        return set()


def assign_country_to_clubs(df, clubs_set, country_name):
    try:

        # Check if the required columns exist
        if 'club_name' not in df.columns or 'league_country' not in df.columns:
            raise KeyError("The dataset must contain 'club_name' and 'league_country' columns.")

        # Update the 'league_country' column for matching clubs
        df['league_country'] = df.apply(
            lambda row: country_name if row['club_name'] in clubs_set else row['league_country'], axis=1
        )

        return df
    except Exception as e:
        print(f"An error occurred: {e}")
        return None


def filter_empty_club_names(df):

    try:
        # Remove rows where 'club_name' is empty or missing
        df_filtered = df[df['league_country'].notna() & (df['league_country'] != '')]

        return df_filtered
    except Exception as e:
        print(f"An error occurred: {e}")
        return None


# updated_df = assign_country_to_clubs(df, italian_clubs, "Italy")
#
# if updated_df is not None:
#     updated_df.to_csv(csv_file, index=False)
# print(get_clubs_in_league(df, 'Serie A'))

#df.loc[(df['club_name'] == 'Everton') & (df['league_name'] == 'Primera Division'), 'league_country'] = 'Chile'

countries = [ 'Peru', 'Paraguay', 'Ecuador', 'Bolivia']

# Create a dictionary to store the results
# club_names_by_country = {
#     country: set(df.loc[df['league_country'] == country, 'club_name'])
#     for country in countries
# }
#
# # Print the results
# for country, clubs in club_names_by_country.items():
#     print(f"Clubs in {country}: {clubs}")

#paraguay = {'Tacuary', 'xNacional Asunción', 'Libertad', 'Cerro Porteño', 'General Caballero JLM', 'xSol de América', 'Sportivo Ameliano', 'x12 de Octubre', 'Olimpia', 'xSportivo Luqueño', 'Guaireña', 'Guaraní'}


def print_unique_leagues(club_names):
    for club in club_names:
        leagues = df.loc[df['club_name'] == club, 'league_country'].unique()
        print(f"{club}: {', '.join(leagues)}")

#print_unique_leagues({'River Plate'})
# print_unique_leagues(paraguay)
#df.loc[df['club_name'].isin(paraguay), 'league_country'] = "Paraguay"


df.loc[(df['club_team_id'] == 112584), 'league_country'] = 'Chile'
df.to_csv(csv_file, index=False)

