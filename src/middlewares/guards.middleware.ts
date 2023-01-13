import {Request, Response, NextFunction} from "express";

const isLogged = (req: Request, res: Response, next: NextFunction) => {
    if (req.body.user) {
        next();
    } else {
        res.status(401).send({message: "Please, log in!"});
    }
};

const isGuest = (req: Request, res: Response, next: NextFunction) => {
    if (!req.body.user) {
        next();
    } else {
        res.status(401).send({message: "You are already logged in!"});
    }
};

// TODO: Fix
// export const isOwner = (req: Request, res: Response, next: NextFunction) => {
//   const meetingId = req.params.id;
//   let userId = req.user?.userId;
//   const meetingsCount = user.meetings?.filter(
//     (meeting) => meeting._id === meetingId
//   ).length;
//   if (user && meetingsCount && meetingsCount > 0) {
//     next();
//   } else {
//     res.status(401).send({ message: "You are not authorised!" });
//   }
// };

export {
  isLogged,
  isGuest
}