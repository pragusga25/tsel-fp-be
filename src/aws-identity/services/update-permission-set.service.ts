import { IJwtPayload } from '../../__shared__/interfaces';
import { createLog } from '../../__shared__/utils';
import { db } from '../../db';
import { getPsTagsInfoPayload, updatePermissionSet } from '../helper';
import { UpdatePermissionSetData } from '../validations';

export const updatePermissionSetService = async (
  data: UpdatePermissionSetData,
  currentUser?: IJwtPayload
) => {
  const { tags, arn } = data;

  if (tags) {
    const { isAll, isShow } = getPsTagsInfoPayload(tags);

    const txt1 = isAll
      ? 'ke semua user'
      : `ke beberapa user dengan dengan username berikut: ${tags.values.replace(
          /;/g,
          ', '
        )}`;
    const txt2 = isShow ? 'menampilkan' : 'menyembunyikan';

    const logMessage = `${currentUser?.name} ${txt2} permission set dengan arn ${arn} ${txt1}`;

    await db.$transaction(async (trx) => {
      await updatePermissionSet(data);
      await createLog(logMessage, trx);
    });
  }
};
