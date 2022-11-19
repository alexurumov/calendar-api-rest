function isLogged() {
    return (req, res, next) => {
        if (req.user) {
            next();
        } else {
            res.status(401).send({ message: "Please, log in!" });
        }
    }
}

function isGuest() {
    return (req, res, next) => {
        if (!req.user) {
            next();
        } else {
            res.status(401).send({ message: "You are already logged in!" });
        }
    }
}

function isOwner() {
    return (req, res, next) => {
        const meetingId = req.params.id;
        const hasMeeting = req.user.meetings.filter(meeting => meeting._id === meetingId).length > 0;
        if (req.user && hasMeeting) {
            next();
        } else {
            res.status(401).send({ message: "You are not authorised!" });
        }
    }
}

module.exports = {
    isLogged,
    isGuest, 
    isOwner
}