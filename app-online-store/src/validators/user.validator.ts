import { error } from 'console';
import validator from 'validator';


export class UserValidator {
	
	static validate(body, toValidate: string[]) {
		const errors: string[] = [];
		
		if (toValidate.includes('name') && 
			validator.isEmpty(body.name)) {
			errors.push('Name cannot be empty');
		}
		if (toValidate.includes('email') && 
			validator.isEmpty(body.email)) {
			errors.push('Email cannot be empty');
		}
		if (toValidate.includes('password') && 
			validator.isEmpty(body.password)) {
			errors.push('Password cannot be negative');
		}
		
		return errors;
	}
}