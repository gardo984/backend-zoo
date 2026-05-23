
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {

	constructor(
		@InjectRepository(User) private userRepository: Repository<User>,
	) {}

	async createOrUpdateUser(userInstance: User): Promise<User> {
		const hash = await bcrypt.hash(userInstance.getPassword(), 10);
		userInstance.setPassword(hash);
		return this.userRepository.save(userInstance)
	}
}