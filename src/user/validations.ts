import { Output, array, minLength, object, string } from 'valibot';

export const DeleteUsersSchema = object({
  ids: array(
    string('Id must be a string', [minLength(1)]),
    'The input must be an array of ids.',
    [minLength(1, 'Please input at least one id.')]
  ),
});

export type DeleteUsersData = Output<typeof DeleteUsersSchema>;
