import { Request, Response, NextFunction } from 'express';
import { CustomError } from './errorHandler.js';

export const validateSimulationRequest = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const { scenario, speed } = req.body;

  if (!scenario) {
    throw new CustomError('Scenario is required', 400);
  }

  if (!['pollution', 'flood', 'contamination'].includes(scenario)) {
    throw new CustomError(
      'Invalid scenario. Must be one of: pollution, flood, contamination',
      400
    );
  }

  if (speed !== undefined) {
    if (typeof speed !== 'number' || speed < 1 || speed > 10) {
      throw new CustomError('Speed must be a number between 1 and 10', 400);
    }
  }

  next();
};

export const validateSensorId = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const { id } = req.params;

  if (!id || id.trim() === '') {
    throw new CustomError('Sensor ID is required', 400);
  }

  next();
};
