export interface BaseRepository<E, D> {
    create(dto: D): Promise<E>;
    findAll(): Promise<E[] | undefined>;
    findById(id: string): Promise<E | null>;
    // findAllBy<ParamDto extends Pick<D, keyof D>>(params: Required<ParamDto>): Promise<E[]>;
    delete(id: string): Promise<E | null>;
    updateById(id: string, dto: D): Promise<E | null>;
}