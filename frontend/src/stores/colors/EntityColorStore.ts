import 'reflect-metadata';
import { injectable } from 'inversify';
import { BehaviorSubject, Observable } from 'rxjs';
import { common } from '@material-ui/core/colors';
import EntityVisualisationAttributes, {
  NodeVisualisationAttributes,
} from './EntityVisualisationAttributes';
import getNthColor from './getNthColor';
import { EdgeDescriptor, NodeDescriptor } from '../../shared/entities';
import { ArgumentError } from '../../shared/errors';
import { QueryNodeResult, QueryEdgeResult } from '../../shared/queries';
import getTextColor from './getTextColor';

export type EntityColorizer<E extends Entity = Entity> = {
  colorize: (
    entity: Entity
  ) => // If entity is EdgeDescriptor: Returns EntityVisualisationAttributes
  E extends EdgeDescriptor
    ? EntityVisualisationAttributes
    : // If entity is NodeDescriptor: Returns NodeVisualisationAttributes
    E extends NodeDescriptor
    ? NodeVisualisationAttributes
    : // Else does not happen; fallback to never
      never;
};

const isEdgeDescriptor = (
  e: EdgeDescriptor | NodeDescriptor
): e is EdgeDescriptor => 'type' in e;

const isNodeDescriptor = (
  e: EdgeDescriptor | NodeDescriptor
): e is NodeDescriptor => 'types' in e;

type Entity =
  | EdgeDescriptor
  | NodeDescriptor
  | QueryNodeResult
  | QueryEdgeResult;

/**
 * A simple store contains a single state.
 * The current state can be retrieved with {@link getValue} (just once)
 * and with {@link getState} (until unsubscribed).
 */
@injectable()
export class EntityColorStore {
  protected readonly entityTypeColorMap = new Map<string, string>();
  /**
   * Contains the state.
   * Returns the current state immediately after subscribing.
   * @protected
   */
  protected readonly storeSubject = new BehaviorSubject<EntityColorizer>(
    this.getEntityColorizer()
  );

  /**
   * Returns the entity colorizing function.
   * @protected
   */
  protected getEntityColorizer(): EntityColorizer {
    /**
     * Defines the coloring definition for nodes and edges.
     *
     * If entity is subsidiary:
     *   If entity is Node: colored border, white background
     *   If entity is Edge: black edge
     */
    return {
      colorize: (entity: Entity) => {
        const ret: NodeVisualisationAttributes = {
          color: common.black,
          border: { color: common.black },
          text: { color: common.black },
        };

        const type = this.getTypeOfEntity(entity);

        let mainColor;
        if (isEdgeDescriptor(entity) && this.greyScaleEdges.value) {
          mainColor = common.black;
        } else {
          mainColor = this.entityTypeColorMap.get(type);
        }

        if (!mainColor) {
          // main color not yet found for this entity type
          mainColor = getNthColor(this.entityTypeColorMap.size);
          this.entityTypeColorMap.set(type, mainColor);
        }

        // Coloring if entity is subsidiary
        if (this.isSubsidiary(entity)) {
          // Set border color to main color.
          ret.border.color = mainColor;
          if (isNodeDescriptor(entity)) {
            // Fill nodes white
            ret.color = common.white;
          }
        } else {
          // Set color = borderColor = mainColor
          ret.color = mainColor;
          ret.border.color = mainColor;
        }

        // Will also return NodeVisualisationAttributes for Edges in contrast to
        // the type definition.
        // This is done for simplicity. If the return type is computed differently,
        // this function will be much more complex.
        // However, the type definition ensures that callers that call this function
        // with an EdgeDescriptor will 'see' only EntityVisualisationAttributes.
        ret.text.color = getTextColor(ret.color);
        return ret;
      },
    };
  }

  protected getTypeOfEntity(entity: Entity): string {
    if (isEdgeDescriptor(entity)) {
      return `EDGE ${entity.type}`;
    }
    if (isNodeDescriptor(entity)) {
      return `NODE ${entity.types
        .map((x) => x)
        .sort((a, b) => a.localeCompare(b))
        .join(' ')}`;
    }
    /* istanbul ignore next */
    throw new ArgumentError('Argument is neither a node nor an edge');
  }

  /**
   * Returns true if parameter is subsidiary.
   * @private
   */
  private isSubsidiary(entity: Entity): boolean {
    return 'subsidiary' in entity && entity.subsidiary === true;
  }

  /**
   * Returns an observable that outputs the stored value.
   */
  public getState(): Observable<EntityColorizer> {
    return this.storeSubject.pipe();
  }

  /**
   * Returns the current value of the stored value.
   */
  public getValue(): EntityColorizer {
    return this.storeSubject.value;
  }

  private readonly greyScaleEdges = new BehaviorSubject<boolean>(false);

  /**
   * Getter for greyScaleEdges property
   * @returns An Observable holding a boolean determining whether edges should be in greyscale or colored
   */
  public getGreyScaleEdges(): Observable<boolean> {
    return this.greyScaleEdges.pipe();
  }

  public setGreyScaleEdges(greyScale: boolean): void {
    this.greyScaleEdges.next(greyScale);
    this.storeSubject.next(this.getEntityColorizer());
  }
}

export default EntityColorStore;