package com.tms.backend.event;

import com.tms.backend.model.Trip;
import org.springframework.context.ApplicationEvent;

public class TripCompletedEvent extends ApplicationEvent {

    private final Trip trip;

    public TripCompletedEvent(Object source, Trip trip) {
        super(source);
        this.trip = trip;
    }

    public Trip getTrip() {
        return trip;
    }
}
