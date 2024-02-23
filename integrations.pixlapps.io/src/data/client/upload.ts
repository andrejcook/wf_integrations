import { Attachment } from '@/types';
import { API_ENDPOINTS } from './api-endpoints';
import { HttpClient } from './http-client';

export const uploadClient = {
  upload: async (variables: any) => {
    let formData = new FormData();
    //  if (id) formData.append('refId', id);
    //if (ref) formData.append('ref', ref);
    //if (field) formData.append('field', field);
    //if (path) formData.append('path', path);

    variables.files.forEach((attachment: any) => {
      formData.append('files', attachment, attachment.name);
    });
    const options = {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    };
    if (variables.id) {
      HttpClient.delete<Attachment>(
        `${API_ENDPOINTS.ATTACHMENTS}/files/${variables.id}`,
      );
      return HttpClient.post<Attachment>(
        API_ENDPOINTS.ATTACHMENTS,
        formData,
        options,
      );
    } else {
      return HttpClient.post<Attachment>(
        API_ENDPOINTS.ATTACHMENTS,
        formData,
        options,
      );
    }
  },

  remove: async (id: string) => {
    return HttpClient.delete<Attachment>(
      `${API_ENDPOINTS.ATTACHMENTS}/files/${id}`,
    );
  },
};
