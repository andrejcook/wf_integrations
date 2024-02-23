import { API_ENDPOINTS } from '@/data/client/api-endpoints';
import { uploadClient } from '@/data/client/upload';
import { useMutation, useQueryClient } from 'react-query';

export const useUploadMutation = () => {
  const queryClient = useQueryClient();

  return useMutation(
    (input: any) => {
      return uploadClient.upload(input);
    },
    {
      // Always refetch after error or success:
      onSettled: () => {
        queryClient.invalidateQueries(API_ENDPOINTS.ATTACHMENTS);
      },
    },
  );
};

export const useRemoveMutation = () => {
  const queryClient = useQueryClient();
  return useMutation(
    (input: any) => {
      return uploadClient.remove(input);
    },
    {
      // Always refetch after error or success:
      onSettled: () => {
        queryClient.invalidateQueries(API_ENDPOINTS.ATTACHMENTS);
      },
    },
  );
};
