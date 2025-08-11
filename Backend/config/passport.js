const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/User');

passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
    try {
        const user = await User.findById(id);
        done(null, user);
    } catch (err) {
        done(err, null);
    }
});

passport.use(
    new GoogleStrategy(
        {
            clientID: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            callbackURL: `${process.env.BACKEND_URL}/auth/google/callback`
        },
        async (accessToken, refreshToken, profile, done) => {
            try {
                let user = await User.findOne({ googleId: profile.id });

                if (!user) {
                    const nameParts = profile.displayName.split(' ');
                    const f_name = nameParts[0] || '';
                    const l_name = nameParts.slice(1).join(' ') || '';

                    let uniqueUsername = profile.displayName;
                    let usernameExists = await User.findOne({ username: uniqueUsername });
                    let counter = 1;
                    while (usernameExists) {
                        uniqueUsername = `${profile.displayName}${counter}`;
                        usernameExists = await User.findOne({ username: uniqueUsername });
                        counter++;
                    }

                    user = await User.create({
                        googleId: profile.id,
                        email: profile.emails[0].value,
                        f_name: f_name,
                        l_name: l_name,
                        username: uniqueUsername,
                        age: null,
                        city: '',
                        country: '',
                        phoneNumber: '',
                        numberOfTrips: 0,
                        placesVisited: [],
                        recentlyVisited: ''
                    });
                }

                return done(null, user);
            } catch (err) {
                return done(err, null);
            }
        }
    )
);

module.exports = passport;
