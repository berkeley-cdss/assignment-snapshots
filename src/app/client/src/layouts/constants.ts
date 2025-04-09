export const utils = `"""Maps: Utilities"""
# <include topics/header_c88c.py>

from math import sqrt

# Rename the built-in zip (http://docs.python.org/3/library/functions.html#zip)
_zip = zip

def map_and_filter(s, map_fn, filter_fn):
    """Returns a new list containing the results of calling map_fn on each
    element of sequence s for which filter_fn returns a true value.

    >>> square = lambda x: x * x
    >>> is_odd = lambda x: x % 2 == 1
    >>> map_and_filter([1, 2, 3, 4, 5], square, is_odd)
    [1, 9, 25]
    """
    # BEGIN SOLUTION "Question 0" ALT="return ['REPLACE THIS WITH YOUR LIST COMPREHENSION']"
    return [map_fn(x) for x in s if filter_fn(x)]
    # END SOLUTION

def key_of_min_value(d):
    """Returns the key in a dict d that corresponds to the minimum value of d.

    >>> letters = {'a': 6, 'b': 5, 'c': 4, 'd': 5}
    >>> min(letters)
    'a'
    >>> key_of_min_value(letters)
    'c'
    """
    # BEGIN SOLUTION "Question 0" ALT="return min('REPLACE THIS WITH YOUR SOLUTION')"
    return min(d, key=lambda x: d[x])
    # END SOLUTION

def zip(*sequences):
    """Returns a list of lists, where the i-th list contains the i-th
    element from each of the argument sequences.

    >>> zip(range(0, 3), range(3, 6))
    [[0, 3], [1, 4], [2, 5]]
    >>> for a, b in zip([1, 2, 3], [4, 5, 6]):
    ...     print(a, b)
    1 4
    2 5
    3 6
    >>> for triple in zip(['a', 'b', 'c'], [1, 2, 3], ['do', 're', 'mi']):
    ...     print(triple)
    ['a', 1, 'do']
    ['b', 2, 're']
    ['c', 3, 'mi']
    """
    return list(map(list, _zip(*sequences)))

def enumerate(s, start=0):
    """Returns a list of lists, where the i-th list contains i+start and
    the i-th element of s.

    >>> enumerate([6, 1, 'a'])
    [[0, 6], [1, 1], [2, 'a']]
    >>> enumerate('five', 5)
    [[5, 'f'], [6, 'i'], [7, 'v'], [8, 'e']]
    """
    # BEGIN SOLUTION "Question 0"
    return zip(range(start, start+len(s)), s)
    # END SOLUTION

def distance(pos1, pos2):
    """Returns the Euclidean distance between pos1 and pos2, which are pairs.

    >>> distance([1, 2], [4, 6])
    5.0
    """
    return sqrt((pos1[0] - pos2[0]) ** 2 + (pos1[1] - pos2[1]) ** 2)

def mean(s):
    """Returns the arithmetic mean of a sequence of numbers s.

    >>> mean([-1, 3])
    1.0
    >>> mean([0, -3, 2, -1])
    -0.5
    """
    assert len(s) > 0, 'cannot find mean of empty sequence'
    return sum(s) / len(s)
`;

export const abstractions = `"""Maps: Data Abstractions"""
# <include topics/header_c88c.py>

from utils import mean

#############################
# Phase 1: Data Abstraction #
#############################


# Reviews

def make_review(restaurant_name, score):
    """Return a review data abstraction."""
    return [restaurant_name, score]

def review_restaurant_name(review):
    """Return the restaurant name of the review, which is a string."""
    return review[0]

def review_score(review):
    """Return the number of stars given by the review, which is a
    floating point number between 1 and 5."""
    return review[1]


# Users

def make_user(name, reviews):
    """Return a user data abstraction."""
    return [name, {review_restaurant_name(r): r for r in reviews}]

def user_name(user):
    """Return the name of the user, which is a string."""
    return user[0]

def user_reviews(user):
    """Return a dictionary from restaurant names to reviews by the user."""
    return user[1]


### === +++ USER ABSTRACTION BARRIER +++ === ###

def user_reviewed_restaurants(user, restaurants):
    """Return the subset of restaurants reviewed by user.

    Arguments:
    user -- a user
    restaurants -- a list of restaurant data abstractions
    """
    names = list(user_reviews(user))
    return [r for r in restaurants if restaurant_name(r) in names]

def user_score(user, restaurant_name):
    """Return the score given for restaurant_name by user."""
    reviewed_by_user = user_reviews(user)
    user_review = reviewed_by_user[restaurant_name]
    return review_score(user_review)


# Restaurants

def make_restaurant(name, location, categories, price, reviews):
    """Return a restaurant data abstraction."""
    # "Question 1": You may change this starter implementation however you wish, including
    # adding more items to the dictionary below.
    return {
        'name': name,
        'location': location,
        'categories': categories,
        'price': price,
        # BEGIN SOLUTION NO PROMPT
        'scores': [review_score(r) for r in reviews],
        # END SOLUTION
    }

def restaurant_name(restaurant):
    """Return the name of the restaurant, which is a string."""
    return restaurant['name']

def restaurant_location(restaurant):
    """Return the location of the restaurant, which is a list containing
    latitude and longitude."""
    return restaurant['location']

def restaurant_categories(restaurant):
    """Return the categories of the restaurant, which is a list of strings."""
    return restaurant['categories']

def restaurant_price(restaurant):
    """Return the price of the restaurant, which is a number."""
    return restaurant['price']

def restaurant_scores(restaurant):
    """Return a list of scores, which are numbers from 1 to 5, of the
    restaurant based on the reviews of the restaurant."""
    # BEGIN SOLUTION "Question 1"
    return restaurant['scores']
    # END SOLUTION


### === +++ RESTAURANT ABSTRACTION BARRIER +++ === ###

def restaurant_num_scores(restaurant):
    """Return the number of scores for restaurant."""
    # BEGIN SOLUTION "Question 2"
    return len(restaurant_scores(restaurant))
    # END SOLUTION

def restaurant_mean_score(restaurant):
    """Return the mean score for restaurant."""
    # BEGIN SOLUTION "Question 2"
    return mean(restaurant_scores(restaurant))
    # END SOLUTION
`;

export const recommend = `"""Maps: A Yelp-powered Restaurant Recommendation Program"""
# <include topics/header_c88c.py>

from random import sample

from abstractions import *
from data import ALL_RESTAURANTS, CATEGORIES, USER_FILES, load_user_file
from ucb import main
from utils import distance, mean, zip, enumerate
from visualize import draw_map

##################################
# Phase 2: Unsupervised Learning #
##################################


def find_closest(location, centroids):
    """Return the centroid in centroids that is closest to location.
    If multiple centroids are equally close, return the first one.

    >>> find_closest([3.0, 4.0], [[0.0, 0.0], [2.0, 3.0], [4.0, 3.0], [5.0, 5.0]])
    [2.0, 3.0]
    """
    # BEGIN SOLUTION "Question 3"
    return min(centroids, key=lambda centroid: distance(location, centroid))
    # END SOLUTION


def group_by_key(pairs):
    """Given a list of lists, where each inner list is a [key, value] pair,
    return a new list that groups values by their key.

    Arguments:
    pairs -- a sequence of [key, value] pairs

    >>> example = [ [1, 2], [3, 2], [2, 4], [1, 3], [3, 1], [1, 2] ]
    >>> group_by_key(example)
    [[2, 3, 2], [2, 1], [4]]
    """
    keys = []
    for key, _ in pairs:
        if key not in keys:
            keys.append(key)
    return [[v for k, v in pairs if k == key] for key in keys]


def group_by_centroid(restaurants, centroids):
    """Return a list of clusters, where each cluster contains all restaurants
    nearest to a corresponding centroid in centroids. Each item in
    restaurants should appear once in the result, along with the other
    restaurants closest to the same centroid.
    >>> r1 = make_restaurant('X', [4, 3], [], 3, [
    ...         make_review('X', 4.5),
    ...      ]) # r1's location is [4,3]
    >>> r2 = make_restaurant('Y', [-2, -4], [], 4, [
    ...         make_review('Y', 3),
    ...         make_review('Y', 5),
    ...      ]) # r2's location is [-2, -4]
    >>> r3 = make_restaurant('Z', [-1, 2], [], 2, [
    ...         make_review('Z', 4)
    ...      ]) # r3's location is [-1, 2]
    >>> c1 = [4, 5]
    >>> c2 = [0, 0]
    >>> groups = group_by_centroid([r1, r2, r3], [c1, c2])
    >>> [[restaurant_name(r) for r in g] for g in groups]
    [['X'], ['Y', 'Z']] # r1 is closest to c1, r2 and r3 are closer to c2
    """
    # BEGIN SOLUTION "Question 4"
    locations = [restaurant_location(r) for r in restaurants]
    closest_centroids = [find_closest(loc, centroids) for loc in locations]
    return group_by_key(zip(closest_centroids, restaurants))
    # END SOLUTION


def find_centroid(cluster):
    """Return the centroid of the locations of the restaurants in cluster.
    >>> r1 = make_restaurant('X', [4, 3], [], 3, [
    ...         make_review('X', 4.5),
    ...      ]) # r1's location is [4,3]
    >>> r2 = make_restaurant('Y', [-3, 1], [], 4, [
    ...         make_review('Y', 3),
    ...         make_review('Y', 5),
    ...      ]) # r2's location is [-3, 1]
    >>> r3 = make_restaurant('Z', [-1, 2], [], 2, [
    ...         make_review('Z', 4)
    ...      ]) # r3's location is [-1, 2]
    >>> cluster = [r1, r2, r3]
    >>> find_centroid(cluster)
    [0.0, 2.0]
    """
    # BEGIN SOLUTION "Question 5"
    locations = [restaurant_location(r) for r in cluster]
    mean_x = mean([x for x, _ in locations])
    mean_y =  mean([y for _, y in locations])
    return [mean_x, mean_y]
    # END SOLUTION


def k_means(restaurants, k, max_updates=100):
    """Use k-means to group restaurants by location into k clusters."""
    assert len(restaurants) >= k, 'Not enough restaurants to cluster'
    previous_centroids = []
    n = 0
    # Select initial centroids randomly by choosing k different restaurants
    centroids = [restaurant_location(r) for r in sample(restaurants, k)]

    while previous_centroids != centroids and n < max_updates:
        previous_centroids = centroids
        # BEGIN SOLUTION "Question 6"
        clusters = group_by_centroid(restaurants, centroids)
        centroids = [find_centroid(cluster) for cluster in clusters]
        # END SOLUTION
        n += 1
    return centroids


def find_predictor(user, restaurants, feature_fn):
    """Return a score predictor (a function that takes in a restaurant
    and returns a predicted score) for a user by performing least-squares
    linear regression using feature_fn on the items in restaurants.
    Also, return the R^2 value of this model.

    Arguments:
    user -- A user
    restaurants -- A sequence of restaurants
    feature_fn -- A function that takes a restaurant and returns a number
    """
    # Dictionary comprehension (very similar to list comprehension)
    # that creates a dictionary, reviews_by_user, where the key
    # is the name of the restaurant the user reviewed, and the value
    # is the review score for that restaurant.
    reviews_by_user = {review_restaurant_name(review): review_score(review)
                       for review in user_reviews(user).values()}

    xs = [feature_fn(r) for r in restaurants]
    ys = [reviews_by_user[restaurant_name(r)] for r in restaurants]

    # BEGIN SOLUTION "Question 7" ALT="b, a, r_squared = 0, 0, 0  # REPLACE THIS LINE WITH YOUR SOLUTION (can be multiple lines)"
    mean_x, mean_y = mean(xs), mean(ys)
    sum_xx, sum_yy, sum_xy = 0, 0, 0
    for x, y in zip(xs, ys):
        x_diff, y_diff = x - mean_x, y - mean_y
        sum_xx += x_diff ** 2
        sum_yy += y_diff ** 2
        sum_xy += x_diff * y_diff
    b = sum_xy / sum_xx
    a = mean_y - b * mean_x
    r_squared = (sum_xy ** 2) / (sum_xx * sum_yy)
    # END SOLUTION

    def predictor(restaurant):
        return b * feature_fn(restaurant) + a

    return predictor, r_squared


def best_predictor(user, restaurants, feature_fns):
    """Find the feature within feature_fns that gives the highest R^2 value
    for predicting scores by the user; return a predictor using that feature.

    Arguments:
    user -- A user
    restaurants -- A list of restaurants
    feature_fns -- A sequence of functions that each takes a restaurant
    """
    reviewed = user_reviewed_restaurants(user, restaurants)
    # BEGIN SOLUTION "Question 8"
    predictors = [find_predictor(user, reviewed, fn) for fn in feature_fns]
    return max(predictors, key=lambda pair: pair[1])[0]
    # END SOLUTION


def rate_all(user, restaurants, feature_fns):
    """Return the predicted scores of restaurants by user using the best
    predictor based on a function from feature_fns.

    Arguments:
    user -- A user
    restaurants -- A list of restaurants
    feature_fns -- A sequence of feature functions
    """
    predictor = best_predictor(user, ALL_RESTAURANTS, feature_fns)
    reviewed = user_reviewed_restaurants(user, restaurants)
    # BEGIN SOLUTION "Question 9"
    predictions = {}
    for restaurant in restaurants:
        name = restaurant_name(restaurant)
        if restaurant in reviewed:
            predictions[name] = user_score(user, name)
        else:
            predictions[name] = predictor(restaurant)
    return predictions
    # END SOLUTION


def search(query, restaurants):
    """Return each restaurant in restaurants that has query as a category.

    Arguments:
    query -- A string
    restaurants -- A sequence of restaurants
    """
    # BEGIN SOLUTION "Question 10"
    return [r for r in restaurants if query in restaurant_categories(r)]
    # END SOLUTION


def feature_set():
    """Return a sequence of feature functions."""
    return [restaurant_mean_score,
            restaurant_price,
            restaurant_num_scores,
            lambda r: restaurant_location(r)[0],
            lambda r: restaurant_location(r)[1]]


@main
def main(*args):
    import argparse
    parser = argparse.ArgumentParser(
        description='Run Recommendations',
        formatter_class=argparse.RawTextHelpFormatter
    )
    parser.add_argument('-u', '--user', type=str, choices=USER_FILES,
                        default='test_user',
                        metavar='USER',
                        help='user file, e.g.\n' +
                        '{{{}}}'.format(','.join(sample(USER_FILES, 3))))
    parser.add_argument('-k', '--k', type=int, help='for k-means')
    parser.add_argument('-q', '--query', choices=CATEGORIES,
                        metavar='QUERY',
                        help='search for restaurants by category e.g.\n'
                        '{{{}}}'.format(','.join(sample(list(CATEGORIES), 3))))
    parser.add_argument('-p', '--predict', action='store_true',
                        help='predict scores for all restaurants')
    parser.add_argument('-r', '--restaurants', action='store_true',
                        help='outputs a list of restaurant names')
    args = parser.parse_args()

    # Output a list of restaurant names
    if args.restaurants:
        print('Restaurant names:')
        for restaurant in sorted(ALL_RESTAURANTS, key=restaurant_name):
            print(repr(restaurant_name(restaurant)))
        exit(0)

    # Select restaurants using a category query
    if args.query:
        restaurants = search(args.query, ALL_RESTAURANTS)
    else:
        restaurants = ALL_RESTAURANTS

    # Load a user
    assert args.user, 'A --user is required to draw a map'
    user = load_user_file('{}.dat'.format(args.user))

    # Collect ratings
    if args.predict:
        ratings = rate_all(user, restaurants, feature_set())
    else:
        restaurants = user_reviewed_restaurants(user, restaurants)
        names = [restaurant_name(r) for r in restaurants]
        ratings = {name: user_score(user, name) for name in names}

    # Draw the visualization
    if args.k:
        centroids = k_means(restaurants, min(args.k, len(restaurants)))
    else:
        centroids = [restaurant_location(r) for r in restaurants]
    draw_map(centroids, restaurants, ratings)
`;

export const autograder_output = `Running OkPy...
OkPy complete...
=====================================================================
Assignment: Project 1: Yelp Maps
OK, version v1.18.1
=====================================================================

~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
Scoring tests

---------------------------------------------------------------------
Problem 0 Utils > Suite 1 > Case 1

>>> from utils import *
>>> square = lambda x: x * x
>>> is_odd = lambda x: x % 2 == 1
>>> map_and_filter([1, 2, 3, 4, 5], square, is_odd)
[1, 9, 25]
>>> map_and_filter(['hi', 'hello', 'hey', 'world'],
...                lambda x: x[4], lambda x: len(x) > 4)
['o', 'd']
-- OK! --

---------------------------------------------------------------------
Problem 0 Utils > Suite 1 > Case 2

>>> from utils import *
>>> key_of_min_value({1: 6, 2: 5, 3: 4})
3
>>> key_of_min_value({'a': 6, 'b': 5, 'c': 4})
'c'
>>> key_of_min_value({'hello': 'world', 'hi': 'there'})
'hi'
-- OK! --

---------------------------------------------------------------------
Problem 0 Utils > Suite 1 > Case 3

>>> from utils import *
>>> enumerate([6, 'one', 'a'], 3)[1]
[4, 'one']
-- OK! --

---------------------------------------------------------------------
Problem 0 Utils
    Passed: 1
    Failed: 0
[ooooooooook] 100.0% passed
`;
