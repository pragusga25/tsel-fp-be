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
      from: optional(string([regex(/^\d+$/, 'From must be a number.')])),
      to: optional(string([regex(/^\d+$/, 'To must be a number.')])),
    },
    [
      forward(
        custom(
          ({ cursor }) => Number(cursor) >= 0,
          'Cursor must be greater than or equal to 0.'
        ),
        ['cursor']
      ),
      forward(
        custom(
          ({ from }) => (from ? Number(from) > 0 : true),
          'From must be greater than or equal to 0.'
        ),
        ['from']
      ),
      forward(
        custom(
          ({ to }) => (to ? Number(to) > 0 : true),
          'To must be greater than or equal to 0.'
        ),
        ['to']
      ),
    ]
  ),
  ({ cursor, from, to }) => {
    return {
      cursor: Number(cursor),
      from: from ? new Date(Number(from)) : undefined,
      to: to ? new Date(Number(to)) : undefined,
    };
  }
);

export type ListLogsData = Output<typeof ListLogsSchema>;
