import {
  Output,
  custom,
  forward,
  minValue,
  number,
  object,
  optional,
  regex,
  string,
  transform,
} from 'valibot';

export const ListLogsSchema = transform(
  object(
    {
      cursor: optional(
        string([regex(/^\d+$/, 'Cursor must be a number.')]),
        '0'
      ),
    },
    [
      forward(
        custom(
          ({ cursor }) => Number(cursor) >= 0,
          'Cursor must be greater than or equal to 0.'
        ),
        ['cursor']
      ),
    ]
  ),
  ({ cursor }) => {
    return { cursor: Number(cursor) };
  }
);

export type ListLogsData = Output<typeof ListLogsSchema>;
