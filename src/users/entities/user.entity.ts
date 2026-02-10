import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from "typeorm";
import { Exclude, Type } from "class-transformer";
import { Post } from "../../posts/entities/post.entity";

@Entity("users")
export class User {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ unique: true })
  email: string;

  @Column()
  name: string;

  @Column()
  @Exclude()
  password: string;

  @OneToMany(() => Post, (post) => post.user)
  @Type(() => Post)
  posts: Post[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
