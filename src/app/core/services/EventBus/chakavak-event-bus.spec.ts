/* tslint:disable:no-unused-variable */

import { ChakavakEventsBus } from './chakavak-event-bus';
import { Observable, Subscriber } from 'rxjs';

describe('ChakavakEventsBus', (): void => {
    let pubService: ChakavakEventsBus;

    beforeEach(() => {
        pubService = new ChakavakEventsBus();
    });

    describe('subscribe', (): void => {
        it('should throw an error when event is falsy', (): void => {
            expect(() => pubService.subscribe(undefined)).toThrow();
        });

        it('should return an observable when there is no callback', (): void => {
            let result: any = pubService.subscribe('test');
            expect(result instanceof Observable).toBeTruthy();
        });

        it('should return a subscriber when there is a callback specified', (): void => {
            let result: any = pubService.subscribe('test', (v: any): void => {
                '';
            });
            expect(result instanceof Subscriber).toBeTruthy();
        });
    });

    describe('publish', (): void => {
        it('should throw an error when event is falsy', (): void => {
            expect(() => pubService.publish(undefined)).toThrow();
        });

        it('should do nothing when an event is not registered', (): void => {
            expect(() => pubService.publish('not-registered')).not.toThrow();
        });

        it('should publish with parameters if the event is registered', (): void => {
            let subscriberEventSpy: jasmine.Spy = jasmine.createSpy('subscriberEvent');
            pubService.subscribe('new-event', subscriberEventSpy);

            pubService.publish('new-event', 'foo');

            expect(subscriberEventSpy).toHaveBeenCalledWith('foo');
        });
    });
});
