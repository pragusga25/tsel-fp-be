import { listAccounts } from '../helper';

export const listAwsAccountsService = async () => {
  const result = await listAccounts();

  result.sort(({ name: aname }, { name: bname }) => {
    if (aname && bname) {
      return aname.localeCompare(bname);
    }

    return 0;
  });

  return { result };
};
