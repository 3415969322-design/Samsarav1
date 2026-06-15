import { T } from "@/components/i18n/text";
import type { TagType } from "@/generated/prisma/enums";
import { TagChip } from "@/features/tags/tag-chip";

type TagOption = {
  color: string;
  id: string;
  name: string;
  type: TagType;
};

export function TagCheckboxes({
  selectedIds = [],
  tags,
}: {
  selectedIds?: string[];
  tags: TagOption[];
}) {
  if (tags.length === 0) {
    return (
      <p className="text-xs text-muted">
        <T k="tags.emptyReusable" />
      </p>
    );
  }

  return (
    <div className="flex flex-wrap gap-2">
      {tags.map((tag) => (
        <label
          className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-line bg-background px-2.5 py-1 text-xs"
          key={tag.id}
        >
          <input
            className="h-3.5 w-3.5"
            defaultChecked={selectedIds.includes(tag.id)}
            name="tagIds"
            type="checkbox"
            value={tag.id}
          />
          <TagChip color={tag.color} name={tag.name} />
        </label>
      ))}
    </div>
  );
}
