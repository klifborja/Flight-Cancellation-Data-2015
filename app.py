import os

import pandas as pd
import numpy as np

import sqlalchemy
from sqlalchemy.ext.automap import automap_base
from sqlalchemy.orm import Session
from sqlalchemy import create_engine

from flask import Flask, jsonify, render_template, url_for
from flask_sqlalchemy import SQLAlchemy

app = Flask(__name__)


#################################################
# Database Setup
#################################################
# link to database
app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///db/flights_summary.sqlite"
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)

# reflect an existing database into a new model
Base = automap_base()
# reflect the tables
Base.prepare(db.engine, reflect=True)

# Save references for each table
Destinations = Base.classes.destination_summary
Origins = Base.classes.origin_summary
OriginsExp = Base.classes.origin_summary_expanded

Cancellations = Base.classes.monthly_cancellation

Pie = Base.classes.pie
Donut = Base.classes.donut
AirlineDelayCounts = Base.classes.airline_delay_early_counts
Reasons = Base.classes.cancellation_reason


@app.route("/")
def index():
    """Return the homepage."""
    return render_template("index.html")



# list of all origin airport codes
@app.route("/origin_codes")
def names():
    """Return a list of airport code names."""

    # Use Pandas to perform the sql query
    stmt = db.session.query(Origins).statement
    df = pd.read_sql_query(stmt, db.session.bind)

    # Return a list of the origin_airport codes names (entire column)
    return jsonify(df["origin_airport"].tolist())   
    

@app.route("/origin_airport_name")
def airport():
    """Return a list of airport names."""

    # Use Pandas to perform the sql query
    stmt = db.session.query(Origins).statement
    df = pd.read_sql_query(stmt, db.session.bind)

    # Return a list of the origin city names (entire column)
    return jsonify(df["origin_airport_name"].tolist())  



@app.route("/city")
def city():
    """Return a list of airport city names."""

    # Use Pandas to perform the sql query
    stmt = db.session.query(Origins).statement
    df = pd.read_sql_query(stmt, db.session.bind)

    # Return a list of the origin city names (entire column)
    return jsonify(df["origin_city"].tolist())  
    


# sort by origin airport code
@app.route("/origin_code_metadata/<origin_airport>")
def origin_metadata(origin_airport):
    """Return the origin code metadata for a given origin_airport."""
    sel = [
        Origins.origin_airport,
        Origins.origin_airport_name,
        Origins.origin_city,
        Origins.origin_state,
        Origins.origin_latitude,
        Origins.origin_longitude,
        Origins.mean_arrival_delay,
        Origins.flight_count,
        Origins.flight_count_delay_ratio,
    ]

    results = db.session.query(*sel).filter(Origins.origin_airport == origin_airport).all()

    # Create a dictionary entry for each row of metadata information
    origin_metadata = {}
    for result in results:
        origin_metadata["origin_airport"] = result[0]
        origin_metadata["origin_airport_name"] = result[1]
        origin_metadata["origin_city"] = result[2]
        origin_metadata["origin_state"] = result[3]
        origin_metadata["origin_latitude"] = result[4]
        origin_metadata["origin_longitude"] = result[5]
        origin_metadata["mean_arrival_delay"] = result[6]
        origin_metadata["flight_count"] = result[7]
        origin_metadata["flight_count_delay_ratio"] = result[8]

    #print(origin_metadata)
    return jsonify([origin_metadata])


# all origin codes: json array, list of objects
@app.route("/origin_code_all")
def origin_metadata_all():
    """Return the origin code metadata for a given origin_airport."""
    sel = [
        Origins.origin_airport,
        Origins.origin_airport_name,
        Origins.origin_city,
        Origins.origin_state,
        Origins.origin_latitude,
        Origins.origin_longitude,
        Origins.mean_arrival_delay,
        Origins.flight_count,
        Origins.flight_count_delay_ratio,
    ]

    results = db.session.query(*sel).all()

    # Create a dictionary entry for each row of metadata information
    airport_all = []
    for result in results:
        origin_metadata = {}
        origin_metadata["origin_airport"] = result[0]
        origin_metadata["origin_airport_name"] = result[1]
        origin_metadata["origin_city"] = result[2]
        origin_metadata["origin_state"] = result[3]
        origin_metadata["origin_latitude"] = result[4]
        origin_metadata["origin_longitude"] = result[5]
        origin_metadata["mean_arrival_delay"] = result[6]
        origin_metadata["flight_count"] = result[7]
        origin_metadata["flight_count_delay_ratio"] = result[8]
        airport_all.append(origin_metadata)

    #print(airport_all)
    return jsonify(airport_all)


# LINE CHART end point
@app.route("/line")
def line():
    """Return the cancellation metadata for a given airline."""
    sel = [
        Cancellations.id,
        Cancellations.month,
        Cancellations.airline,
        Cancellations.cancelled,
    ]

    results = db.session.query(*sel).all()

    # Create a dictionary entry for each row of metadata information
    cancellations_all = []
    for result in results:
        cancellation_metadata = {}
        cancellation_metadata["id"] = result[0]
        cancellation_metadata["month"] = result[1]
        cancellation_metadata["airline"] = result[2]
        cancellation_metadata["cancelled"] = result[3]
        cancellations_all.append(cancellation_metadata)

    #print(cancellations_all)
    return jsonify(cancellations_all)


# PIE CHART end point
@app.route("/pie")
def pie():
    """Return the origin code metadata for a given origin_airport."""
    sel = [
        Pie.label,
        Pie.count,
    ]

    results = db.session.query(*sel).all()

    # Create a dictionary entry for each row of metadata information
    airline_all = []
    for result in results:
        airline_metadata = {}
        airline_metadata["label"] = result[0]
        airline_metadata["count"] = result[1]
        airline_all.append(airline_metadata)

    #print(airline_all)
    return jsonify(airline_all)



# DONUT1 CHART end point
@app.route("/donut1")
def donut1():
    """Return the origin code metadata for a given origin_airport."""
    sel = [
        Donut.label,
        Donut.total,
        Donut.percent,
    ]

    results = db.session.query(*sel).all()

    # Create a dictionary entry for each row of metadata information
    donut1_all = []
    for result in results:
        donut1_metadata = {}
        donut1_metadata["label"] = result[0]
        donut1_metadata["total"] = result[1]
        donut1_metadata["percent"] = result[2]
        donut1_all.append(donut1_metadata)

    #print(donut1_all)
    return jsonify(donut1_all)


# DONUT2 CHART end point
@app.route("/donut2")
def donut2():
    """Return the counts metadata for a given cancellation reason."""
    sel = [
        Donut.label,
        Donut.total,
    ]

    results = db.session.query(*sel).all()

    # Create a dictionary entry for each row of metadata information
    donut2_all = []
    for result in results:
        donut2_metadata = {}
        donut2_metadata["label"] = result[0]
        donut2_metadata["count"] = result[1]
        donut2_all.append(donut2_metadata)

    #print(donut1_all)
    return jsonify(donut2_all)


# BAR CHART end point
@app.route("/bar")
def bar():
    """Return the delay counts metadata for a given airline."""
    sel = [
        AirlineDelayCounts.airline,
        AirlineDelayCounts.departure_delay,
        AirlineDelayCounts.arrival_delay,
        AirlineDelayCounts.early_departure,
        AirlineDelayCounts.early_arrival,
    ]

    results = db.session.query(*sel).all()

    # Create a dictionary entry for each row of metadata information
    bar_all = []
    for result in results:
        bar_metadata = {}
        bar_metadata["airline"] = result[0]
        bar_metadata["departure_delay"] = result[1]
        bar_metadata["arrival_delay"] = result[2]
        bar_metadata["early_departure"] = result[3]
        bar_metadata["early_arrival"] = result[4]
        bar_all.append(bar_metadata)

    #print(bar_all)
    return jsonify(bar_all)



# sort by destination airport code
@app.route("/destination_code_metadata/<destination_airport>")
def destination_metadata(destination_airport):
    """Return the destination code metadata for a given destination_airport."""
    sel = [
        Destinations.destination_airport,
        Destinations.destination_airport_name,
        Destinations.destination_city,
        Destinations.destination_state,
        Destinations.destination_latitude,
        Destinations.destination_longitude,
        Destinations.mean_departure_delay,
        Destinations.flight_count,
        Destinations.flight_count_delay_ratio,
    ]

    results = db.session.query(*sel).filter(Destinations.destination_airport == destination_airport).all()

    # Create a dictionary entry for each row of metadata information
    destination_metadata = {}
    for result in results:
        destination_metadata["destination_airport"] = result[0]
        destination_metadata["destination_airport_name"] = result[1]
        destination_metadata["destination_city"] = result[2]
        destination_metadata["destination_state"] = result[3]
        destination_metadata["destination_latitude"] = result[4]
        destination_metadata["destination_longitude"] = result[5]
        destination_metadata["mean_departure_delay"] = result[6]
        destination_metadata["flight_count"] = result[7]
        destination_metadata["flight_count_delay_ratio"] = result[8]

    #print(destination_metadata)
    return jsonify(destination_metadata)



@app.route("/rank_delay")
def tobs():
    """rank the origin delay only take positive delay values rank desc by arrival delay"""
    sel = [
        Origins.mean_arrival_delay,
        Origins.origin_airport,
        Origins.origin_airport_name,
        Origins.origin_city,
        Origins.origin_state,
        Origins.origin_latitude,
        Origins.origin_longitude,
        Origins.flight_count,
        Origins.flight_count_delay_ratio,
    ]
    results = db.session.query(*sel).filter(Origins.mean_arrival_delay > 0).order_by(Origins.mean_arrival_delay.desc()).all()
    
    rank_origin_delay = {}
    for result in results:
        rank_origin_delay["mean_arrival_delay"] = result[0]
        rank_origin_delay["origin_airport"] = result[1]
        rank_origin_delay["origin_airport_name"] = result[2]
        rank_origin_delay["origin_city"] = result[3]
        rank_origin_delay["origin_state"] = result[4]
        rank_origin_delay["origin_latitude"] = result[5]
        rank_origin_delay["origin_longitude"] = result[6]
        rank_origin_delay["flight_count"] = result[7]
        rank_origin_delay["flight_count_delay_ratio"] = result[8]

    #print(rank_origin_delay)
    return jsonify(rank_origin_delay)

    

if __name__ == "__main__":
    app.run(debug=True)