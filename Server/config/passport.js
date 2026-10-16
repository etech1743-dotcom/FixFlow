const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const User = require("../models/user");

passport.use(
    new GoogleStrategy(
        {
            clientID: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            callbackURL: process.env.GOOGLE_CALLBACK_URL
        },

        async (accessToken, refreshToken, profile, done) => {

            try {

                const googleId = profile.id;
                const email = profile.emails[0].value;
                const name = profile.displayName;
                const profileImage = profile.photos?.[0]?.value;

                let user = await User.findOne({
                    $or: [
                        { googleId: googleId },
                        { email: email }
                    ]
                });

                // Existing user
                if (user) {

                    if (!user.googleId) {
                        user.googleId = googleId;
                        user.profileImage = profileImage;

                        await user.save();
                    }

                    return done(null, user);
                }

                // New Google user
                user = await User.create({
                    name: name,
                    email: email,
                    googleId: googleId,
                    profileImage: profileImage,
                    role: "user",
                    isActive: true
                });

                return done(null, user);

            } catch (error) {

                console.log("Google authentication error:", error);

                return done(error, null);
            }
        }
    )
);

module.exports = passport;