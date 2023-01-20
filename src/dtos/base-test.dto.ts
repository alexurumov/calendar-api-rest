import {AutoMap} from "@automapper/classes";

// class BaseTestDto {
//     name!: string;
//     message?: string;
// }
//
// export class TestDto extends BaseTestDto{
//     _id?: string,
// }
//
export type PathParamTestDto = Required<Pick<TestDto, "_id">>

export type ReqQueryTestDto = Partial<TestDto>;

export class TestDto {
    @AutoMap()
    _id?: string;

    @AutoMap()
    name!: string;

    @AutoMap()
    message!: string;
}