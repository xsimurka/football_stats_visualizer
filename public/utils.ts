/**
 * Generates a player's photo URL.
 * @param player_id - The unique identifier for the player.
 * @param fifa_version - The FIFA version number.
 * @param size - Size of resulting image in pixels.
 * @returns URL in string.
 */
function getPlayersPhotoURL(player_id: number, fifa_version: number, size: number): string {
    const idString = player_id.toString()
    return `https://cdn.sofifa.net/players/${idString.slice(0, 3)}/${idString.slice(3)}/${fifa_version}_${size}.png`;
}

/**
 * Generates a club's logo URL.
 * @param club_id The unique identifier for the club
 * @param size - Size of resulting image in pixels.
 * @returns URL in string.
 */
function getClubLogoURL(club_id: number, size: number): string {
    return `https://cdn.sofifa.net/teams/${club_id}/${size}.png`
}