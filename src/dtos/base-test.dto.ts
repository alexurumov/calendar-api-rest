interface BaseTestDto {
    name: string,
    message?: string
}

export interface TestDto extends BaseTestDto{
    _id?: string,
}

export interface ReqQueryTestDto extends Partial<BaseTestDto>{}