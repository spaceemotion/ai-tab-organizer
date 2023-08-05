export const mapTabIds = (tabs: { id?: number | undefined }[]) => (
  tabs
    .map((tab) => tab.id)
    .filter((id): id is number => !!id)
);
