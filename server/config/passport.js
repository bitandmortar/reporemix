const passport = require('passport');
const GitHubStrategy = require('passport-github2').Strategy;
const { query } = require('./database');
const logger = require('./logger');

// Configure GitHub Strategy
passport.use(
  new GitHubStrategy(
    {
      clientID: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
      callbackURL:
        process.env.GITHUB_CALLBACK_URL
        || 'http://localhost:3000/auth/github/callback',
      scope: ['user', 'repo', 'read:org'],
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        logger.info(`GitHub OAuth callback for user: ${profile.username}`);

        // Extract user data from GitHub profile
        const userData = {
          github_id: profile.id,
          username: profile.username,
          email:
            profile.emails && profile.emails[0]
              ? profile.emails[0].value
              : null,
          avatar_url:
            profile.photos && profile.photos[0]
              ? profile.photos[0].value
              : null,
          access_token: accessToken,
          bio: profile._json.bio,
          location: profile._json.location,
          blog: profile._json.blog,
          public_repos: profile._json.public_repos,
          public_gists: profile._json.public_gists,
          followers: profile._json.followers,
          following: profile._json.following,
        };

        // Check if user exists
        const existingUser = await query(
          'SELECT * FROM users WHERE github_id = $1',
          [userData.github_id],
        );

        let user;

        if (existingUser.rows.length > 0) {
          // Update existing user
          const updateResult = await query(
            `UPDATE users 
           SET username = $1, 
               email = $2, 
               avatar_url = $3, 
               access_token = $4,
               bio = $5,
               location = $6,
               blog = $7,
               public_repos = $8,
               public_gists = $9,
               followers = $10,
               following = $11,
               updated_at = CURRENT_TIMESTAMP
           WHERE github_id = $12
           RETURNING *`,
            [
              userData.username,
              userData.email,
              userData.avatar_url,
              userData.access_token,
              userData.bio,
              userData.location,
              userData.blog,
              userData.public_repos,
              userData.public_gists,
              userData.followers,
              userData.following,
              userData.github_id,
            ],
          );
          [user] = updateResult.rows;
          logger.info(`Updated existing user: ${user.username}`);
        } else {
          // Create new user
          const insertResult = await query(
            `INSERT INTO users (
            github_id, username, email, avatar_url, access_token,
            bio, location, blog, public_repos, public_gists, followers, following
           ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
           RETURNING *`,
            [
              userData.github_id,
              userData.username,
              userData.email,
              userData.avatar_url,
              userData.access_token,
              userData.bio,
              userData.location,
              userData.blog,
              userData.public_repos,
              userData.public_gists,
              userData.followers,
              userData.following,
            ],
          );
          [user] = insertResult.rows;

          // Create default user preferences
          await query('INSERT INTO user_preferences (user_id) VALUES ($1)', [
            user.id,
          ]);

          logger.info(`Created new user: ${user.username}`);
        }

        return done(null, user);
      } catch (error) {
        logger.error('Error in GitHub OAuth callback:', error);
        return done(error);
      }
    },
  ),
);

// Serialize user for session
passport.serializeUser((user, done) => {
  done(null, user.id);
});

// Deserialize user from session
passport.deserializeUser(async (id, done) => {
  try {
    const result = await query('SELECT * FROM users WHERE id = $1', [id]);
    if (result.rows.length === 0) {
      return done(null, false);
    }
    return done(null, result.rows[0]);
  } catch (error) {
    logger.error('Error deserializing user:', error);
    return done(error);
  }
});

module.exports = passport;
