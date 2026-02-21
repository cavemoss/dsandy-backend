import { OrderTrackingDTO } from '../entities/order.entity';

export const updateOrderTrackingData = (dto: OrderTrackingDTO, newDTO?: OrderTrackingDTO) => {
  if (!newDTO) return;

  const newStages = newDTO.stages.filter(
    newStage =>
      dto.stages.findIndex(
        stage =>
          stage.name == newStage.name &&
          stage.description == newStage.description &&
          stage.timestamp == newStage.timestamp,
      ) < 0,
  );

  dto.stages.unshift(...newStages);
};

export const pushOrderTrackingStage = (
  dto: OrderTrackingDTO,
  stage: OrderTrackingDTO['stages'][0],
) => {
  dto.stages.unshift(stage);
};
