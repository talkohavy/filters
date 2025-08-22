import type { ExtractNestedValueFromItemProps } from './types';
import { validateFieldPath } from './validation';
import { FieldPathError } from './errors';

/**
 * Extracts a nested value from an object using a dot-separated field path.
 * Returns the value, the last traversed object, and the last key.
 * Throws FieldPathError for invalid paths.
 */
function extractNestedValueFromItem(props: ExtractNestedValueFromItemProps) {
  const { item, fieldName } = props;

  validateFieldPath(fieldName);

  const fieldParts = fieldName?.split('.');
  const lastKey = fieldParts.at(-1);
  let itemValue: any = item;
  let lastItem: any = item;

  try {
    fieldParts.forEach((subKeyPart) => {
      lastItem = itemValue;
      if (itemValue == null) {
        itemValue = undefined;
        return;
      }
      itemValue = itemValue[subKeyPart];
    });
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
