#!/usr/local/bin/python3

import sys
import csv
import json

def main(csvFile, eraName):
    # circle pack json
    jsonOut = {
        "name": "root",
        "children": [] # list of cluster dictionaries
    }

    statKeys, allPlayers = [], []
    with open(csvFile) as f:
        csv_reader = csv.reader(f, delimiter=',')
        for i, row in enumerate(csv_reader):
            # header of csv
            if i == 0:
                statKeys = row[1:]
            else:
                plyrDict = dict(zip(statKeys, row[1:]))
                allPlayers.append(plyrDict)
    
    # now sort based on cluster type
    allPlayers = sorted(allPlayers, key=lambda x : x['Cluster'])
    
    # add in cluster children
    curClusName = allPlayers[0]['Cluster']
    curClusDict = {
        "name": curClusName,
        "children": []
    }
    for plyrDict in allPlayers:
        if plyrDict['Cluster'] != curClusName:
            # add in all people of that cluster
            jsonOut['children'].append(curClusDict)
            curClusName = plyrDict['Cluster']
            curClusDict = {
                "name": curClusName,
                "children": []
            }
        else:
            curClusDict['children'].append(plyrDict)
    
    # json should be ready now
    with open(eraName + '.json','w') as jsonFile:
        json.dump(jsonOut, jsonFile)


if __name__ == "__main__":
    if len(sys.argv) > 3:
        sys.exit(1)
    
    main(sys.argv[1], sys.argv[2])