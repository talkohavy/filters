import type { ExtractNestedValueFromItemProps } from './types';
import { validateFieldPath } from './validation';
import { FieldPathError } from './errors';

/**
 * Extracts a nested value from an object using a dot-separated field path.
 * Uses a static cache for field path splits to optimize repeated extraction.
 * Returns the value, the last traversed object, and the last key.
 * Throws FieldPathError for invalid paths.
 */
const fieldPathCache = new Map<string, string[]>();
function extractNestedValueFromItem(props: ExtractNestedValueFromItemProps) {
  const { item, fieldName } = props;

  validateFieldPath(fieldName);

  let fieldParts = fieldPathCache.get(fieldName);
  if (!fieldParts) {
    fieldParts = fieldName.split('.');
    fieldPathCache.set(fieldName, fieldParts);
  }
  const lastKey = fieldParts.at(-1);
  let itemValue: any = item;
  let lastItem: any = item;

  try {
    for (let i = 0; i < fieldParts.length; i++) {
      const subKeyPart = fieldParts[i];
      lastItem = itemValue;
      if (itemValue == null) {
        itemValue = undefined;
        break;
      }
      if (typeof subKeyPart === 'undefined') {
        itemValue = undefined;
        break;
      }
      itemValue = itemValue[subKeyPart as keyof typeof itemValue];
    }
  } catch (error) {
    if (error instanceof FieldPathError) {
      throw error;
    }
    const errorMessage = error instanceof Error ? error.message : String(error);
    throw new FieldPathError(`Failed to navigate field path '${fieldName}': ${errorMessage}`, {
      fieldPath: fieldName,
      originalError: errorMessage,
      item: typeof item === 'object' ? '[object]' : item,
    });
  }

  return { itemValue, lastItem, lastKey };
}

export { extractNestedValueFromItem };
