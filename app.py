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

app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///db/flights_summary.sqlite"
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)

# reflect an existing database into a new model
Base = automap_base()
# reflect the tables
Base.prepare(db.engine, reflect=True)

# Save references to each table
Destinations = Base.classes.destination_summary
Origins = Base.classes.origin_summary


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

    print(origin_metadata)
    return jsonify([origin_metadata])


# sort by origin airport code
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

    print(airport_all)
    return jsonify(airport_all)




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

    print(destination_metadata)
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

    print(rank_origin_delay)
    return jsonify(rank_origin_delay)


# @app.route("/destination_airport/<destination_airport>")
# def destination_airport(destination_airport):
#     """Return `destination_airport_name`, `destination_city`, `destination_state` and `mean_departure_delay`. """
#     stmt = db.session.query(Destinations).statement
#     df = pd.read_sql_query(stmt, db.session.bind)

#     # Filter the data based on the sample number and
#     # only keep rows with values above 1
#     sample_data = df.loc[df["mean_departure_delay"] > 0, ["destination_airport_name", "destination_city", "destination_state", destination_airport]]

#     # Sort by sample
#     sample_data.sort_values(by=destination_airport, ascending=False, inplace=True)

#     # Format the data to send as json
#     data = {
#         "destination_airport_name": sample_data.destination_airport_name.tolist(),
#         "destination_airport": sample_data[destination_airport].tolist(),
#         "destination_city": sample_data.destination_city.tolist(),
#         "destination_state": sample_data.destination_state.tolist(),
#         "mean_departure_delay": sample_data.mean_departure_delay.values.tolist(),
#     }
#     return jsonify(data)


if __name__ == "__main__":
    app.run(debug=True)