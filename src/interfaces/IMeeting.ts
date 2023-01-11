

export interface IMeeting {
    _id?: string | number;
    name?: string;
    startTime?: Date;
    endTime?: Date;
    room?: string;
    owner?: <IUser>;
}