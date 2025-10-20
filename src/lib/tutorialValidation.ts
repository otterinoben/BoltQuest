/**
 * Tutorial Validation System
 * Handles validation of tutorial steps and user interactions
 */

import { TutorialValidation, TutorialStepDefinition } from '@/types/tutorial';

// Validation result types
export interface ValidationResult {
  isValid: boolean;
  message: string;
  nextAction?: string;
  retryCount?: number;
  maxRetries?: number;
}

// Validation error types
export enum ValidationError {
  ELEMENT_NOT_FOUND = 'ELEMENT_NOT_FOUND',
  ELEMENT_NOT_VISIBLE = 'ELEMENT_NOT_VISIBLE',
  ELEMENT_NOT_INTERACTABLE = 'ELEMENT_NOT_INTERACTABLE',
  VALIDATION_FAILED = 'VALIDATION_FAILED',
  TIMEOUT = 'TIMEOUT',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR'
}

// Validation configuration
const VALIDATION_CONFIG = {
  TIMEOUT: 5000, // 5 seconds
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000, // 1 second
  ELEMENT_WAIT_TIME: 100 // 100ms
} as const;

/**
 * Main validation function
 */
export const validateStep = (step: TutorialStepDefinition): TutorialValidation => {
  try {
    // Check if target element exists
    if (step.targetElement) {
      const element = document.querySelector(step.targetElement);
      if (!element) {
        return {
          isValid: false,
          message: `Target element not found: ${step.targetElement}`,
          retryCount: 0,
          maxRetries: VALIDATION_CONFIG.RETRY_ATTEMPTS
        };
      }

      // Check if element is visible
      if (!isElementVisible(element)) {
        return {
          isValid: false,
          message: `Target element is not visible: ${step.targetElement}`,
          retryCount: 0,
          maxRetries: VALIDATION_CONFIG.RETRY_ATTEMPTS
        };
      }

      // Check if element is interactable
      if (!isElementInteractable(element)) {
        return {
          isValid: false,
          message: `Target element is not interactable: ${step.targetElement}`,
          retryCount: 0,
          maxRetries: VALIDATION_CONFIG.RETRY_ATTEMPTS
        };
      }
    }

    // Run step-specific validation
    if (step.validation) {
      const validationResult = step.validation();
      if (!validationResult) {
        return {
          isValid: false,
          message: `Step validation failed: ${step.id}`,
          retryCount: 0,
          maxRetries: VALIDATION_CONFIG.RETRY_ATTEMPTS
        };
      }
    }

    // Run action-specific validation
    const actionValidation = validateAction(step);
    if (!actionValidation.isValid) {
      return actionValidation;
    }

    return {
      isValid: true,
      message: 'Step validation successful'
    };

  } catch (error) {
    console.error('Error validating step:', error);
    return {
      isValid: false,
      message: `Validation error: ${error instanceof Error ? error.message : 'Unknown error'}`,
      retryCount: 0,
      maxRetries: VALIDATION_CONFIG.RETRY_ATTEMPTS
    };
  }
};

/**
 * Validate specific actions
 */
const validateAction = (step: TutorialStepDefinition): TutorialValidation => {
  switch (step.action) {
    case 'click':
      return validateClick(step);
    case 'hover':
      return validateHover(step);
    case 'form':
      return validateForm(step);
    case 'scroll':
      return validateScroll(step);
    case 'wait':
      return validateWait(step);
    case 'navigation':
      return validateNavigation(step);
    default:
      return { isValid: true, message: 'No action validation required' };
  }
};

/**
 * Validate click action
 */
const validateClick = (step: TutorialStepDefinition): TutorialValidation => {
  if (!step.targetElement) {
    return { isValid: true, message: 'No target element for click validation' };
  }

  const element = document.querySelector(step.targetElement) as HTMLElement;
  if (!element) {
    return {
      isValid: false,
      message: `Click target not found: ${step.targetElement}`
    };
  }

  // Check if element is clickable
  if (element.disabled || element.getAttribute('aria-disabled') === 'true') {
    return {
      isValid: false,
      message: `Element is disabled and cannot be clicked: ${step.targetElement}`
    };
  }

  // Check if element is in viewport
  if (!isElementInViewport(element)) {
    return {
      isValid: false,
      message: `Element is not in viewport: ${step.targetElement}`,
      nextAction: 'scroll'
    };
  }

  return { isValid: true, message: 'Click validation successful' };
};

/**
 * Validate hover action
 */
const validateHover = (step: TutorialStepDefinition): TutorialValidation => {
  if (!step.targetElement) {
    return { isValid: true, message: 'No target element for hover validation' };
  }

  const element = document.querySelector(step.targetElement) as HTMLElement;
  if (!element) {
    return {
      isValid: false,
      message: `Hover target not found: ${step.targetElement}`
    };
  }

  // Check if element is hoverable
  if (element.getAttribute('aria-hidden') === 'true') {
    return {
      isValid: false,
      message: `Element is hidden and cannot be hovered: ${step.targetElement}`
    };
  }

  return { isValid: true, message: 'Hover validation successful' };
};

/**
 * Validate form action
 */
const validateForm = (step: TutorialStepDefinition): TutorialValidation => {
  if (!step.targetElement) {
    return { isValid: true, message: 'No target element for form validation' };
  }

  const element = document.querySelector(step.targetElement) as HTMLFormElement | HTMLInputElement;
  if (!element) {
    return {
      isValid: false,
      message: `Form target not found: ${step.targetElement}`
    };
  }

  // Check if it's a form element
  if (!(element instanceof HTMLFormElement) && !(element instanceof HTMLInputElement)) {
    return {
      isValid: false,
      message: `Element is not a form element: ${step.targetElement}`
    };
  }

  // Check if form is valid
  if (element instanceof HTMLFormElement) {
    if (!element.checkValidity()) {
      return {
        isValid: false,
        message: `Form validation failed: ${step.targetElement}`
      };
    }
  }

  return { isValid: true, message: 'Form validation successful' };
};

/**
 * Validate scroll action
 */
const validateScroll = (step: TutorialStepDefinition): TutorialValidation => {
  if (!step.targetElement) {
    return { isValid: true, message: 'No target element for scroll validation' };
  }

  const element = document.querySelector(step.targetElement) as HTMLElement;
  if (!element) {
    return {
      isValid: false,
      message: `Scroll target not found: ${step.targetElement}`
    };
  }

  // Check if element is scrollable
  if (element.scrollHeight <= element.clientHeight) {
    return {
      isValid: false,
      message: `Element is not scrollable: ${step.targetElement}`
    };
  }

  return { isValid: true, message: 'Scroll validation successful' };
};

/**
 * Validate wait action
 */
const validateWait = (step: TutorialStepDefinition): TutorialValidation => {
  // Wait actions don't need validation
  return { isValid: true, message: 'Wait validation successful' };
};

/**
 * Validate navigation action
 */
const validateNavigation = (step: TutorialStepDefinition): TutorialValidation => {
  // Navigation actions don't need validation
  return { isValid: true, message: 'Navigation validation successful' };
};

/**
 * Check if element is visible
 */
const isElementVisible = (element: Element): boolean => {
  const style = window.getComputedStyle(element);
  return (
    style.display !== 'none' &&
    style.visibility !== 'hidden' &&
    style.opacity !== '0' &&
    element.offsetWidth > 0 &&
    element.offsetHeight > 0
  );
};

/**
 * Check if element is interactable
 */
const isElementInteractable = (element: Element): boolean => {
  const htmlElement = element as HTMLElement;
  
  // Check if element is disabled
  if (htmlElement.disabled || htmlElement.getAttribute('aria-disabled') === 'true') {
    return false;
  }

  // Check if element is hidden
  if (htmlElement.getAttribute('aria-hidden') === 'true') {
    return false;
  }

  // Check if element has pointer events
  const style = window.getComputedStyle(htmlElement);
  if (style.pointerEvents === 'none') {
    return false;
  }

  return true;
};

/**
 * Check if element is in viewport
 */
const isElementInViewport = (element: HTMLElement): boolean => {
  const rect = element.getBoundingClientRect();
  return (
    rect.top >= 0 &&
    rect.left >= 0 &&
    rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
    rect.right <= (window.innerWidth || document.documentElement.clientWidth)
  );
};

/**
 * Wait for element to be available
 */
export const waitForElement = (
  selector: string,
  timeout: number = VALIDATION_CONFIG.TIMEOUT
): Promise<Element | null> => {
  return new Promise((resolve) => {
    const element = document.querySelector(selector);
    if (element) {
      resolve(element);
      return;
    }

    const observer = new MutationObserver((mutations) => {
      const element = document.querySelector(selector);
      if (element) {
        observer.disconnect();
        resolve(element);
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });

    setTimeout(() => {
      observer.disconnect();
      resolve(null);
    }, timeout);
  });
};

/**
 * Retry validation with exponential backoff
 */
export const retryValidation = async (
  step: TutorialStepDefinition,
  maxRetries: number = VALIDATION_CONFIG.RETRY_ATTEMPTS
): Promise<TutorialValidation> => {
  let retryCount = 0;
  
  while (retryCount < maxRetries) {
    const validation = validateStep(step);
    
    if (validation.isValid) {
      return validation;
    }
    
    retryCount++;
    
    if (retryCount < maxRetries) {
      // Wait before retrying
      await new Promise(resolve => 
        setTimeout(resolve, VALIDATION_CONFIG.RETRY_DELAY * retryCount)
      );
    }
  }
  
  return {
    isValid: false,
    message: `Validation failed after ${maxRetries} attempts`,
    retryCount,
    maxRetries
  };
};

/**
 * Validate step prerequisites
 */
export const validatePrerequisites = (step: TutorialStepDefinition): TutorialValidation => {
  if (!step.prerequisites || step.prerequisites.length === 0) {
    return { isValid: true, message: 'No prerequisites to validate' };
  }
  
  for (const prerequisite of step.prerequisites) {
    const prerequisiteElement = document.querySelector(prerequisite);
    if (!prerequisiteElement) {
      return {
        isValid: false,
        message: `Prerequisite element not found: ${prerequisite}`
      };
    }
  }
  
  return { isValid: true, message: 'All prerequisites validated' };
};

/**
 * Validate step conditions
 */
export const validateConditions = (step: TutorialStepDefinition): TutorialValidation => {
  if (!step.conditions) {
    return { isValid: true, message: 'No conditions to validate' };
  }
  
  try {
    const result = step.conditions();
    if (!result) {
      return {
        isValid: false,
        message: `Step conditions not met: ${step.id}`
      };
    }
  } catch (error) {
    return {
      isValid: false,
      message: `Error checking step conditions: ${error instanceof Error ? error.message : 'Unknown error'}`
    };
  }
  
  return { isValid: true, message: 'All conditions validated' };
};

/**
 * Get validation error message
 */
export const getValidationErrorMessage = (error: ValidationError): string => {
  const messages = {
    [ValidationError.ELEMENT_NOT_FOUND]: 'The target element was not found on the page',
    [ValidationError.ELEMENT_NOT_VISIBLE]: 'The target element is not visible',
    [ValidationError.ELEMENT_NOT_INTERACTABLE]: 'The target element cannot be interacted with',
    [ValidationError.VALIDATION_FAILED]: 'The step validation failed',
    [ValidationError.TIMEOUT]: 'The validation timed out',
    [ValidationError.UNKNOWN_ERROR]: 'An unknown error occurred during validation'
  };
  
  return messages[error] || 'Unknown validation error';
};

export default {
  validateStep,
  validateClick,
  validateHover,
  validateForm,
  validateScroll,
  validateWait,
  validateNavigation,
  waitForElement,
  retryValidation,
  validatePrerequisites,
  validateConditions,
  getValidationErrorMessage
};




