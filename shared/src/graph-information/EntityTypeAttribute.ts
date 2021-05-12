/**
 * Attributes of a entity type.
 * Contains descriptive information about an entity type.
 */
export interface EntityTypeAttribute {
  /**
   * Name of the attribute
   */
  name: string;
  /**
   * Possible data types of the attribute.
   */
  types: ['Long' | 'String' | 'StringArray' | string];
  /**
   * If true, this attribut cannot be null
   */
  mandatory: boolean;
}
