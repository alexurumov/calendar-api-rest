export interface BaseRepository<E, D> {
    create(dto: D): Promise<E>;
    findAll(): Promise<E[]>;
    findById(id: string): Promise<E>;
    // findAllBy<ParamDto extends Pick<D, keyof D>>(params: Required<ParamDto>): Promise<E[]>;
    delete(id: string): Promise<void>;
}